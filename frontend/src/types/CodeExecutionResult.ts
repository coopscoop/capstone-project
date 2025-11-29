import type { LintIssue } from '@/types';

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  lintIssues?: LintIssue[];
  executionTime: number;
}