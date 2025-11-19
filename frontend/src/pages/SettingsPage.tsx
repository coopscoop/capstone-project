import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handlePasswordReset = () => {
    navigate('/reset-password');
  };

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-zinc-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-1">
              {user?.displayName || 'User'}
            </h1>
            <p className="text-zinc-600 text-sm mb-2">{user?.email}</p>
            {user?.isAdmin && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Settings Sections */}
          <div className="space-y-3">
            {/* Style Section */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('style')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 flex items-center justify-between transition-colors"
              >
                <span>Theme</span>
                {openSection === 'style' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === 'style' && (
                <div className="p-4 bg-white">
                  <div className="space-y-3">
                    <button className="w-full py-2 px-4 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-900 transition-colors font-medium">
                      Light Mode
                    </button>
                    <button className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors font-medium">
                      Dark Mode
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Email Change Section */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('email')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 flex items-center justify-between transition-colors"
              >
                <span>Email Change</span>
                {openSection === 'email' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === 'email' && (
                <div className="p-4 bg-white">
                  <p className="text-sm text-zinc-600 mb-3">
                    Current email: <span className="font-medium text-zinc-900">{user?.email}</span>
                  </p>
                  <input
                    type="email"
                    placeholder="New email address"
                    className="w-full px-4 py-2 border border-zinc-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2 px-4 rounded transition-colors">
                    Update Email
                  </button>
                </div>
              )}
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={handlePasswordReset}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 flex items-center justify-between transition-colors group"
              >
                <span>Change Password</span>
                <KeyRound size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">User ID:</span>
                <span className="text-zinc-900 font-medium">{user?.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Account Created:</span>
                <span className="text-zinc-900 font-medium">
                  {user?.timeCreated ? new Date(user.timeCreated).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Account Type:</span>
                <span className={`font-medium ${user?.isAdmin ? 'text-purple-600' : 'text-blue-600'}`}>
                  {user?.isAdmin ? 'Administrator' : 'Standard User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;