import { apiRequest } from '@/utils/api';
import type { PasswordResetResponse } from '@/types';

export const passwordResetService = {
  async getByUserId(userId: number): Promise<any> {
    const response = await apiRequest(`/PasswordReset/user/${userId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch password reset request');
    }

    return response.json();
  },

  async validateResetCode(resetCode: string): Promise<boolean> {
    const response = await apiRequest(`/PasswordReset/validate/${resetCode}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to validate reset code');
    }

    return response.json();
  },

  async createResetRequest(userId: number): Promise<PasswordResetResponse> {
    const response = await apiRequest(`/PasswordReset/create/${userId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create reset request');
    }

    return response.json();
  },

  async resetPassword(resetCode: string, newPassword: string): Promise<void> {
    const response = await apiRequest('/PasswordReset/reset', {
      method: 'POST',
      body: JSON.stringify({ resetCode, newPassword }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to reset password');
    }
  },

  async deleteResetRequest(userId: number): Promise<void> {
    const response = await apiRequest(`/PasswordReset/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete reset request');
    }
  },
};