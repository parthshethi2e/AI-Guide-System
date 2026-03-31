import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { assessmentsTable } from "@workspace/db/schema";
import { eq, count, avg, desc } from "drizzle-orm";

const router: IRouter = Router();

const MATURITY_LABELS: Record<string, string> = {
  nascent: "Nascent",
  emerging: "Emerging",
  developing: "Developing",
  advanced: "Advanced",
  leading: "Leading",
};

router.get("/dashboard/stats", async (req, res) => {
  try {
    const allAssessments = await db.select().from(assessmentsTable);
    const completed = allAssessments.filter((a) => a.status === "completed");

    const totalAssessments = allAssessments.length;
    const completedAssessments = completed.length;

    const averageScore =
      completed.length > 0
        ? completed.reduce((s, a) => s + (a.overallScore ?? 0), 0) / completed.length
        : 0;

    // Find most common maturity level
    const maturityCounts: Record<string, number> = {};
    for (const a of completed) {
      if (a.maturityLevel) {
        maturityCounts[a.maturityLevel] = (maturityCounts[a.maturityLevel] ?? 0) + 1;
      }
    }
    const averageMaturityLevel =
      Object.entries(maturityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "nascent";

    // Assessments this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const assessmentsThisMonth = allAssessments.filter((a) => new Date(a.createdAt) >= monthStart).length;

    // Top industry
    const industryCounts: Record<string, number> = {};
    for (const a of allAssessments) {
      industryCounts[a.industry] = (industryCounts[a.industry] ?? 0) + 1;
    }
    const topIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Technology";

    res.json({
      totalAssessments,
      completedAssessments,
      averageScore: Math.round(averageScore * 10) / 10,
      averageMaturityLevel,
      assessmentsThisMonth,
      topIndustry,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "internal_error", message: "Failed to get dashboard stats" });
  }
});

router.get("/dashboard/maturity-distribution", async (req, res) => {
  try {
    const completed = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.status, "completed"));

    const levels = ["nascent", "emerging", "developing", "advanced", "leading"];
    const distribution: Record<string, number> = {};
    for (const l of levels) {
      distribution[l] = 0;
    }
    for (const a of completed) {
      if (a.maturityLevel) {
        distribution[a.maturityLevel] = (distribution[a.maturityLevel] ?? 0) + 1;
      }
    }

    const total = completed.length;
    const result = levels.map((level) => ({
      level,
      label: MATURITY_LABELS[level] ?? level,
      count: distribution[level] ?? 0,
      percentage: total > 0 ? Math.round(((distribution[level] ?? 0) / total) * 1000) / 10 : 0,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get maturity distribution");
    res.status(500).json({ error: "internal_error", message: "Failed to get maturity distribution" });
  }
});

router.get("/dashboard/recent-assessments", async (req, res) => {
  try {
    const recent = await db
      .select()
      .from(assessmentsTable)
      .orderBy(desc(assessmentsTable.createdAt))
      .limit(10);

    res.json(recent);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent assessments");
    res.status(500).json({ error: "internal_error", message: "Failed to get recent assessments" });
  }
});

router.get("/dashboard/industry-benchmarks", async (req, res) => {
  try {
    const completed = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.status, "completed"));

    const industryData: Record<string, { scores: number[]; count: number }> = {};
    for (const a of completed) {
      if (a.overallScore != null) {
        if (!industryData[a.industry]) {
          industryData[a.industry] = { scores: [], count: 0 };
        }
        industryData[a.industry].scores.push(a.overallScore);
        industryData[a.industry].count++;
      }
    }

    const benchmarks = Object.entries(industryData).map(([industry, data]) => ({
      industry,
      averageScore: Math.round((data.scores.reduce((s, v) => s + v, 0) / data.scores.length) * 10) / 10,
      topScore: Math.round(Math.max(...data.scores) * 10) / 10,
      assessmentCount: data.count,
    }));

    benchmarks.sort((a, b) => b.averageScore - a.averageScore);

    res.json(benchmarks);
  } catch (err) {
    req.log.error({ err }, "Failed to get industry benchmarks");
    res.status(500).json({ error: "internal_error", message: "Failed to get industry benchmarks" });
  }
});

export default router;
