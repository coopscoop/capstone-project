import { apiRequest } from '@/utils/api';
import type { CodeExecutionRequest, CodeLintRequest } from '@/types';

export const codeService = {
  async execute(request: CodeExecutionRequest): Promise<any> {
    const response = await apiRequest('/Code/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to execute code: ${errorText}`);
    }
    return response.json();
  },

  async lint(request: CodeLintRequest): Promise<any> {
    const response = await apiRequest('/Code/lint', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to lint code: ${errorText}`);
    }
    return response.json();
  },
};