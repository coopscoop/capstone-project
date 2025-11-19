import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step tracking
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  
  // Form state
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  // Determine if this is an authenticated password change
  const isAuthenticatedChange = !!user;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First, get the user by email to get their userId
      const userResponse = await fetch(`http://localhost:5225/api/user/email/${email}`);
      
      if (!userResponse.ok) {
        setError('No account found with that email address');
        return;
      }

      const userData = await userResponse.json();
      setUserId(userData.userId);

      // Create password reset request
      const response = await fetch(`http://localhost:5225/api/passwordreset/request/${userData.userId}`, {
        method: 'POST',
      });

      if (response.ok) {
        setStep('code');
      } else {
        setError('Failed to send reset code. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5225/api/passwordreset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetCode: resetCode,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        setStep('success');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Invalid or expired reset code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticatedReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;

    // Validate current password by attempting login
    try {
      const loginResponse = await fetch('http://localhost:5225/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: currentPassword,
        }),
      });

      if (!loginResponse.ok) {
        setError('Current password is incorrect');
        return;
      }

      // If login successful, proceed with reset
      setEmail(user.email);
      setUserId(user.userId);
      setIsLoading(true);

      // Request reset code
      const response = await fetch(`http://localhost:5225/api/passwordreset/request/${user.userId}`, {
        method: 'POST',
      });

      if (response.ok) {
        setStep('code');
      } else {
        setError('Failed to initiate password reset');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify current password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button for non-authenticated users */}
        {!isAuthenticatedChange && step !== 'success' && (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to login
          </Link>
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
            {step === 'code' && 'Enter the code sent to your email'}
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

          {/* Step 1: Email or Current Password (for authenticated users) */}
          {step === 'email' && (
            <form onSubmit={isAuthenticatedChange ? handleAuthenticatedReset : handleRequestReset} className="space-y-6">
              {isAuthenticatedChange ? (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Please enter your current password to continue
                    </p>
                  </div>
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              ) : (
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
                    disabled={isLoading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* Step 2: Enter Code and New Password */}
          {step === 'code' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
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
                  placeholder="Enter the code from your email"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-mono"
                  required
                  disabled={isLoading}
                />
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <KeyRound className="text-green-600" size={32} />
              </div>
              <p className="text-zinc-600">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Additional help text */}
        {step === 'code' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600">
              Didn't receive the code?{' '}
              <button
                onClick={() => {
                  setStep('email');
                  setResetCode('');
                  setError('');
                }}
                className="text-zinc-900 hover:underline font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;