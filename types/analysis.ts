// ─── Analysis Types ────────────────────────────────────────────────────────────

export type RiskLevel = 'high' | 'medium' | 'low' | 'info';

export interface Clause {
  id: string;
  title: string;
  text: string;
  riskLevel: RiskLevel;
  explanation: string;
  suggestedAction: string;
  pageNumber?: number;
}

export interface AnalysisResult {
  documentTitle: string;
  summary: string;
  keyParties: string[];
  effectiveDate: string | null;
  jurisdiction: string | null;
  clauses: Clause[];
  overallRisk: RiskLevel;
  checklist: ChecklistItem[];
  processingTimeMs: number;
}

export interface ChecklistItem {
  id: string;
  action: string;
  priority: 'urgent' | 'important' | 'optional';
  category: 'review' | 'negotiate' | 'clarify' | 'lawyer';
  completed: boolean;
}

export interface AnalysisRequest {
  text: string;
  filename?: string;
  mode?: 'quick' | 'deep';
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
