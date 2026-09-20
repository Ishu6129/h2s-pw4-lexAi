// ─── Chat / Q&A Types ──────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  citations?: Citation[];
}

export interface Citation {
  clauseId?: string;
  text: string;
  pageRef?: string;
}

export interface ChatSession {
  id: string;
  documentText: string;
  documentTitle: string;
  messages: Message[];
  createdAt: number;
}

export interface QARequest {
  question: string;
  documentText: string;
  history: Array<{ role: MessageRole; content: string }>;
}

export interface QAResponse {
  success: boolean;
  answer?: string;
  citations?: Citation[];
  error?: string;
}

export const SUGGESTED_QUESTIONS = [
  'What are the key obligations for each party?',
  'Are there any automatic renewal clauses?',
  'What are the termination conditions?',
  'What penalties or liabilities are mentioned?',
  'Is there a non-compete or non-disclosure clause?',
  'What dispute resolution mechanism is specified?',
  'Are there any unusual or one-sided clauses?',
  'What happens if either party breaches the contract?',
] as const;
