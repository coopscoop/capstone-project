import type { LintIssue } from '@/types';

export interface LintResult {
  issues: LintIssue[];
  score: number;
}