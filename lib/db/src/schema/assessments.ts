import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companySizeEnum = pgEnum("company_size", ["startup", "small", "medium", "large", "enterprise"]);
export const assessmentStatusEnum = pgEnum("assessment_status", ["draft", "in_progress", "completed"]);
export const maturityLevelEnum = pgEnum("maturity_level", ["nascent", "emerging", "developing", "advanced", "leading"]);
export const questionTypeEnum = pgEnum("question_type", ["scale", "multiple_choice", "text"]);
export const timeframeEnum = pgEnum("timeframe", ["short_term", "mid_term", "long_term"]);
export const priorityEnum = pgEnum("priority", ["critical", "high", "medium", "low"]);
export const effortImpactEnum = pgEnum("effort_impact", ["low", "medium", "high"]);
export const responseCategoryEnum = pgEnum("response_category", [
  "data_infrastructure",
  "technology_stack",
  "ai_ml_usage",
  "workforce_skills",
  "leadership_vision",
  "operational_processes",
  "governance_ethics"
]);

export const assessmentsTable = pgTable("assessments", {
  id: serial("id").primaryKey(),
  organizationName: text("organization_name").notNull(),
  industry: text("industry").notNull(),
  companySize: companySizeEnum("company_size").notNull(),
  geography: text("geography").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  status: assessmentStatusEnum("status").notNull().default("draft"),
  maturityLevel: maturityLevelEnum("maturity_level"),
  overallScore: real("overall_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull().references(() => assessmentsTable.id),
  questionId: text("question_id").notNull(),
  category: text("category").notNull(),
  numericValue: real("numeric_value"),
  textValue: text("text_value"),
});

export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({ id: true, createdAt: true });
export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({ id: true });

export type Assessment = typeof assessmentsTable.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
