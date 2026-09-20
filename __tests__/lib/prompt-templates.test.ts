import { describe, it, expect } from 'vitest';
import {
  SYSTEM_ANALYZE,
  SYSTEM_COMPARE,
  SYSTEM_CHECKLIST,
  buildAnalyzePrompt,
  buildComparePrompt,
  buildChecklistPrompt,
  buildQASystemPrompt,
  buildQAUserPrompt,
} from '@/lib/prompt-templates';

describe('Prompt Templates Engine', () => {
  it('defines valid non-empty system prompts for all AI workflows', () => {
    expect(SYSTEM_ANALYZE.length).toBeGreaterThan(100);
    expect(SYSTEM_COMPARE.length).toBeGreaterThan(100);
    expect(SYSTEM_CHECKLIST.length).toBeGreaterThan(100);
  });

  it('builds analyze user prompt with document filename and text', () => {
    const prompt = buildAnalyzePrompt('Sample contract text content', 'NDA.pdf');
    expect(prompt).toContain('NDA.pdf');
    expect(prompt).toContain('Sample contract text content');
  });

  it('builds comparison user prompt with textA and textB', () => {
    const prompt = buildComparePrompt('Text A Content', 'Text B Content');
    expect(prompt).toContain('Text A Content');
    expect(prompt).toContain('Text B Content');
  });

  it('builds checklist prompt containing document text', () => {
    const prompt = buildChecklistPrompt('Obligation details');
    expect(prompt).toContain('Obligation details');
  });

  it('builds grounded QA system prompt containing document context', () => {
    const qaSystem = buildQASystemPrompt('Document context text');
    expect(qaSystem).toContain('Document context text');
    expect(qaSystem).toContain('exclusively');
  });

  it('builds QA user prompt with question string', () => {
    const userPrompt = buildQAUserPrompt('What is the termination period?');
    expect(userPrompt).toContain('What is the termination period?');
  });
});
