import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // This actually calls your backend at POST /api/auth/register
      await register(email, password, displayName || undefined);
      
      // On success, redirect to control panel
      navigate('/control-panel');
    } catch (err) {
      // If registration fails, show error
      setLocalError('Registration failed. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl mb-4">
            <img 
              src="/src/assets/images/python-logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create Account</h1>
          <p className="text-zinc-600">Sign up to get started</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Error Message */}
          {(localError || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{localError || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 mb-2">
                Display Name (Optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-zinc-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                Confirm Password
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={20} />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600">
              Already have an account?{' '}
              <Link to="/login" className="text-zinc-900 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;