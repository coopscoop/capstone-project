// hooks/usePasswordReset.ts
import { useState, useCallback } from 'react';
import { passwordResetService } from '@/services';

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const validateResetCode = useCallback(async (resetCode: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const isValid = await passwordResetService.validateResetCode(resetCode);
      return isValid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate reset code');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const createResetRequest = useCallback(async (userId: number): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await passwordResetService.createResetRequest(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reset request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (resetCode: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await passwordResetService.resetPassword(resetCode, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    loading,
    error,
    validateResetCode,
    createResetRequest,
    resetPassword,
    clearError,
  };
};