/**
 * lib/validators.ts
 * Zod schemas for all API request/response validation.
 */
import { z } from 'zod';

// ─── Request Schemas ───────────────────────────────────────────────────────────

export const AnalyzeRequestSchema = z.object({
  text: z.string().min(50, 'Document text too short').max(100_000, 'Document too large (max 100k chars)'),
  filename: z.string().max(255).optional(),
  mode: z.enum(['quick', 'deep']).default('quick'),
});

export const CompareRequestSchema = z.object({
  textA: z.string().min(50, 'Document A text too short').max(50_000, 'Document A too large'),
  textB: z.string().min(50, 'Document B text too short').max(50_000, 'Document B too large'),
  filenameA: z.string().max(255).optional(),
  filenameB: z.string().max(255).optional(),
});

export const QARequestSchema = z.object({
  question: z.string().min(3, 'Question too short').max(1000, 'Question too long'),
  documentText: z.string().min(50, 'Document text too short').max(100_000, 'Document too large'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(5000),
      })
    )
    .max(20, 'Too many history messages')
    .default([]),
});

export const ChecklistRequestSchema = z.object({
  text: z.string().min(50).max(100_000),
});

// ─── Response Schemas ──────────────────────────────────────────────────────────

export const RiskLevelSchema = z.enum(['high', 'medium', 'low', 'info']);

export const ClauseSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  riskLevel: RiskLevelSchema,
  explanation: z.string(),
  suggestedAction: z.string(),
  pageNumber: z.number().optional(),
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  action: z.string(),
  priority: z.enum(['urgent', 'important', 'optional']),
  category: z.enum(['review', 'negotiate', 'clarify', 'lawyer']),
  completed: z.boolean().default(false),
});

export const AnalysisResultSchema = z.object({
  documentTitle: z.string(),
  summary: z.string(),
  keyParties: z.array(z.string()),
  effectiveDate: z.string().nullable(),
  jurisdiction: z.string().nullable(),
  clauses: z.array(ClauseSchema),
  overallRisk: RiskLevelSchema,
  checklist: z.array(ChecklistItemSchema),
});

export const DiffEntrySchema = z.object({
  id: z.string(),
  section: z.string(),
  type: z.enum(['added', 'removed', 'changed', 'same']),
  originalText: z.string().nullable(),
  revisedText: z.string().nullable(),
  significance: z.enum(['critical', 'notable', 'minor']),
  explanation: z.string(),
});

export const CompareResultSchema = z.object({
  docATitle: z.string(),
  docBTitle: z.string(),
  summary: z.string(),
  totalDiffs: z.number(),
  criticalDiffs: z.number(),
  diffs: z.array(DiffEntrySchema),
  recommendation: z.string(),
});

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;
export type CompareRequestInput = z.infer<typeof CompareRequestSchema>;
export type QARequestInput = z.infer<typeof QARequestSchema>;
