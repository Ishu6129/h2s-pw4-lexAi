/**
 * __tests__/lib/risk-classifier.test.ts
 * Unit tests for the heuristic risk classifier.
 */
import { describe, it, expect } from 'vitest';
import { classifyText, getHighestRisk, scoreDocument } from '@/lib/risk-classifier';

describe('classifyText', () => {
  it('classifies indemnification language as high risk', () => {
    const flags = classifyText('The party shall indemnify and hold harmless against all liability.');
    const highFlags = flags.filter((f) => f.risk === 'high');
    expect(highFlags.length).toBeGreaterThan(0);
    expect(highFlags[0].matchedPattern).toBe('Indemnification');
  });

  it('classifies NDA / confidentiality as medium risk', () => {
    const flags = classifyText('This agreement contains a non-disclosure clause.');
    const medFlags = flags.filter((f) => f.risk === 'medium');
    expect(medFlags.length).toBeGreaterThan(0);
  });

  it('classifies binding arbitration as high risk', () => {
    const flags = classifyText('All disputes shall be resolved through binding arbitration.');
    const high = flags.find((f) => f.matchedPattern === 'Binding arbitration');
    expect(high).toBeDefined();
    expect(high?.risk).toBe('high');
  });

  it('returns empty array for benign text', () => {
    const flags = classifyText('Thank you for your purchase. Have a great day!');
    expect(flags.length).toBe(0);
  });

  it('does not duplicate flags for the same category+risk', () => {
    // Two sentences with "indemnify" — should only produce one flag per category:risk pair
    const flags = classifyText('You shall indemnify us. You agree to indemnify against all claims.');
    const liabilityHighFlags = flags.filter((f) => f.risk === 'high' && f.category === 'liability');
    expect(liabilityHighFlags.length).toBe(1);
  });

  it('handles empty string gracefully', () => {
    const flags = classifyText('');
    expect(flags).toEqual([]);
  });
});

describe('getHighestRisk', () => {
  it('returns high if any flag is high', () => {
    const flags = [
      { matchedPattern: 'A', risk: 'low' as const, category: 'x' },
      { matchedPattern: 'B', risk: 'high' as const, category: 'y' },
    ];
    expect(getHighestRisk(flags)).toBe('high');
  });

  it('returns medium if highest is medium', () => {
    const flags = [
      { matchedPattern: 'A', risk: 'low' as const, category: 'x' },
      { matchedPattern: 'B', risk: 'medium' as const, category: 'y' },
    ];
    expect(getHighestRisk(flags)).toBe('medium');
  });

  it('returns null for empty flags', () => {
    expect(getHighestRisk([])).toBeNull();
  });
});

describe('scoreDocument', () => {
  it('returns highRiskCount above 0 for documents with risky clauses', () => {
    const doc = `
      Party A shall indemnify Party B against all claims.
      Any disputes shall be resolved through binding arbitration.
      This agreement automatically renews unless cancelled.
    `;
    const { highRiskCount } = scoreDocument(doc);
    expect(highRiskCount).toBeGreaterThan(0);
  });

  it('returns zero highRiskCount for benign text', () => {
    const doc = 'This is a friendly letter confirming our meeting on Tuesday.';
    const { highRiskCount } = scoreDocument(doc);
    expect(highRiskCount).toBe(0);
  });

  it('sets overallRisk to null for empty docs', () => {
    const { overallRisk } = scoreDocument('');
    expect(overallRisk).toBeNull();
  });
});
