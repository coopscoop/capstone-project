import { useState } from 'react';
import { apiRequest } from '@/utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePasswordReset } from '@/hooks/usePasswordReset';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { user, logout: LogOut } = useAuth();
  const { loading, error, validateResetCode, createResetRequest, resetPassword, clearError } = usePasswordReset();
  
  // Step tracking
  const [step, setStep] = useState<'email' | 'code' | 'newPassword' | 'success'>('email');
  
  // Form state
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Determine if this is an authenticated password change
  const isAuthenticatedChange = !!user;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Get the user by email to get their userId
      const userResponse = await apiRequest(`/User/email/${email}`);
      
      if (!userResponse.ok) {
        throw new Error('No account found with that email address');
      }

      const userData = await userResponse.json();

      // Create password reset request
      await createResetRequest(userData.userId);
      setStep('code');
    } catch (err) {
      // Error is already set by the hook
      console.error('Reset request failed:', err);
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsValidatingCode(true);

    try {
      const isValid = await validateResetCode(resetCode);
      if (isValid) {
        setStep('newPassword');
      } else {
        throw new Error('Invalid reset code');
      }
    } catch (err) {
      // Error is already set by the hook
      console.error('Code validation failed:', err);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await resetPassword(resetCode, newPassword);
      setStep('success');
    } catch (err) {
      // Error is already set by the hook
      console.error('Password reset failed:', err);
    }
  };

  const handleBackToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        {step !== 'success' && (
          <div className="mb-4">
            {isAuthenticatedChange ? (
              <button
                onClick={handleBackToProfile}
                className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft size={20} />
                Back to Profile
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft size={20} />
                Back to login
              </Link>
            )}
          </div>
        )}

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl mb-4">
            <KeyRound className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            {step === 'success' ? 'Password Reset!' : 'Reset Password'}
          </h1>
          <p className="text-zinc-600">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'code' && 'Enter the 6-digit code sent to your email'}
            {step === 'newPassword' && 'Create your new password'}
            {step === 'success' && 'Your password has been successfully reset'}
          </p>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* Step 2: Enter Code */}
          {step === 'code' && (
            <form onSubmit={handleValidateCode} className="space-y-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  A reset code has been sent to <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="resetCode" className="block text-sm font-medium text-zinc-700 mb-2">
                  Reset Code
                </label>
                <input
                  id="resetCode"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter your code"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-mono text-center text-lg"
                  required
                  disabled={loading || isValidatingCode}
                />
              </div>

              <button
                type="submit"
                disabled={loading || isValidatingCode }
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isValidatingCode ? 'Validating...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setResetCode('');
                    clearError();
                  }}
                  className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline"
                  disabled={loading}
                >
                  Didn't receive the code? Try again
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <p className="text-sm text-green-700">
                    Reset code verified successfully
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-zinc-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <p className="text-zinc-600 mt-2">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button
                onClick={() => {
                  LogOut();
                  navigate('/login')
                }}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium mt-4"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;