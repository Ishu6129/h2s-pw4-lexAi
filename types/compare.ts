// ─── Comparison Types ──────────────────────────────────────────────────────────

export type DiffType = 'added' | 'removed' | 'changed' | 'same';

export interface DiffEntry {
  id: string;
  section: string;
  type: DiffType;
  originalText: string | null;
  revisedText: string | null;
  significance: 'critical' | 'notable' | 'minor';
  explanation: string;
}

export interface CompareResult {
  docATitle: string;
  docBTitle: string;
  summary: string;
  totalDiffs: number;
  criticalDiffs: number;
  diffs: DiffEntry[];
  recommendation: string;
  processingTimeMs: number;
}

export interface CompareRequest {
  textA: string;
  textB: string;
  filenameA?: string;
  filenameB?: string;
}

export interface CompareResponse {
  success: boolean;
  data?: CompareResult;
  error?: string;
}
