import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { assessmentsTable, surveyResponsesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { SURVEY_CATEGORIES } from "../lib/survey-data.js";
import {
  computeCategoryScores,
  classifyMaturityLevel,
  getMaturityLabel,
  generateRecommendations,
  generateExecutiveSummary,
  identifyStrengthsAndGaps,
} from "../lib/recommendation-engine.js";
import { z } from "zod";

const router: IRouter = Router();

const createAssessmentSchema = z.object({
  organizationName: z.string().min(1),
  industry: z.string().min(1),
  companySize: z.enum(["startup", "small", "medium", "large", "enterprise"]),
  geography: z.string().min(1),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
});

const submitAssessmentSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      category: z.string(),
      numericValue: z.number().optional().nullable(),
      textValue: z.string().optional().nullable(),
    })
  ),
});

router.get("/survey/questions", (_req, res) => {
  res.json(SURVEY_CATEGORIES);
});

router.get("/assessments", async (req, res) => {
  try {
    const assessments = await db.select().from(assessmentsTable).orderBy(assessmentsTable.createdAt);
    res.json(assessments);
  } catch (err) {
    req.log.error({ err }, "Failed to list assessments");
    res.status(500).json({ error: "internal_error", message: "Failed to list assessments" });
  }
});

router.post("/assessments", async (req, res) => {
  const parsed = createAssessmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  try {
    const [assessment] = await db
      .insert(assessmentsTable)
      .values({
        organizationName: parsed.data.organizationName,
        industry: parsed.data.industry,
        companySize: parsed.data.companySize,
        geography: parsed.data.geography,
        contactName: parsed.data.contactName ?? null,
        contactEmail: parsed.data.contactEmail ?? null,
        status: "draft",
      })
      .returning();

    res.status(201).json(assessment);
  } catch (err) {
    req.log.error({ err }, "Failed to create assessment");
    res.status(500).json({ error: "internal_error", message: "Failed to create assessment" });
  }
});

router.get("/assessments/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid_id", message: "Invalid assessment ID" });
    return;
  }

  try {
    const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "not_found", message: "Assessment not found" });
      return;
    }

    const responses = await db
      .select()
      .from(surveyResponsesTable)
      .where(eq(surveyResponsesTable.assessmentId, id));

    res.json({ ...assessment, responses });
  } catch (err) {
    req.log.error({ err }, "Failed to get assessment");
    res.status(500).json({ error: "internal_error", message: "Failed to get assessment" });
  }
});

router.post("/assessments/:id/submit", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid_id", message: "Invalid assessment ID" });
    return;
  }

  const parsed = submitAssessmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  try {
    const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "not_found", message: "Assessment not found" });
      return;
    }

    // Delete existing responses
    await db.delete(surveyResponsesTable).where(eq(surveyResponsesTable.assessmentId, id));

    // Insert new responses
    if (parsed.data.answers.length > 0) {
      await db.insert(surveyResponsesTable).values(
        parsed.data.answers.map((a) => ({
          assessmentId: id,
          questionId: a.questionId,
          category: a.category,
          numericValue: a.numericValue ?? null,
          textValue: a.textValue ?? null,
        }))
      );
    }

    // Compute scores
    const categoryScores = computeCategoryScores(parsed.data.answers);
    const totalScore = categoryScores.reduce((s, cs) => s + cs.score, 0);
    const totalMax = categoryScores.reduce((s, cs) => s + cs.maxScore, 0);
    const overallPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

    const maturityLevel = classifyMaturityLevel(overallPercentage);
    const maturityLabel = getMaturityLabel(maturityLevel);
    const recommendations = generateRecommendations(categoryScores, maturityLevel, assessment.industry);
    const executiveSummary = generateExecutiveSummary(
      assessment.organizationName,
      assessment.industry,
      maturityLevel,
      overallPercentage,
      categoryScores
    );
    const { strengthAreas, gapAreas } = identifyStrengthsAndGaps(categoryScores);

    const completedAt = new Date();

    // Update assessment
    await db
      .update(assessmentsTable)
      .set({
        status: "completed",
        maturityLevel,
        overallScore: Math.round(overallPercentage * 10) / 10,
        completedAt,
      })
      .where(eq(assessmentsTable.id, id));

    res.json({
      assessmentId: id,
      organizationName: assessment.organizationName,
      industry: assessment.industry,
      companySize: assessment.companySize,
      maturityLevel,
      maturityLabel,
      overallScore: Math.round(totalScore * 10) / 10,
      maxScore: Math.round(totalMax * 10) / 10,
      percentage: Math.round(overallPercentage * 10) / 10,
      categoryScores,
      recommendations,
      executiveSummary,
      strengthAreas,
      gapAreas,
      completedAt: completedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit assessment");
    res.status(500).json({ error: "internal_error", message: "Failed to submit assessment" });
  }
});

router.get("/assessments/:id/result", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid_id", message: "Invalid assessment ID" });
    return;
  }

  try {
    const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
    if (!assessment) {
      res.status(404).json({ error: "not_found", message: "Assessment not found" });
      return;
    }

    if (assessment.status !== "completed") {
      res.status(400).json({ error: "not_completed", message: "Assessment has not been completed yet" });
      return;
    }

    const responses = await db
      .select()
      .from(surveyResponsesTable)
      .where(eq(surveyResponsesTable.assessmentId, id));

    const categoryScores = computeCategoryScores(
      responses.map((r) => ({
        questionId: r.questionId,
        category: r.category,
        numericValue: r.numericValue,
      }))
    );

    const maturityLevel = assessment.maturityLevel as "nascent" | "emerging" | "developing" | "advanced" | "leading";
    const maturityLabel = getMaturityLabel(maturityLevel);
    const overallPercentage = assessment.overallScore ?? 0;
    const recommendations = generateRecommendations(categoryScores, maturityLevel, assessment.industry);
    const executiveSummary = generateExecutiveSummary(
      assessment.organizationName,
      assessment.industry,
      maturityLevel,
      overallPercentage,
      categoryScores
    );
    const { strengthAreas, gapAreas } = identifyStrengthsAndGaps(categoryScores);

    const totalScore = categoryScores.reduce((s, cs) => s + cs.score, 0);
    const totalMax = categoryScores.reduce((s, cs) => s + cs.maxScore, 0);

    res.json({
      assessmentId: id,
      organizationName: assessment.organizationName,
      industry: assessment.industry,
      companySize: assessment.companySize,
      maturityLevel,
      maturityLabel,
      overallScore: Math.round(totalScore * 10) / 10,
      maxScore: Math.round(totalMax * 10) / 10,
      percentage: overallPercentage,
      categoryScores,
      recommendations,
      executiveSummary,
      strengthAreas,
      gapAreas,
      completedAt: assessment.completedAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get assessment result");
    res.status(500).json({ error: "internal_error", message: "Failed to get assessment result" });
  }
});

export default router;
