import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronDown, ChevronUp, KeyRound, Save, Edit2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/utils/api';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile edit state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handlePasswordReset = () => {
    navigate('/reset-password');
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const response = await apiRequest(`/User/${user.userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          displayName: displayName || null,
          bio: bio || null,
        }),
      });

      if (response.ok) {
        setUpdateSuccess('Profile updated successfully!');
        setIsEditingProfile(false);
        
        // Update user in localStorage
        const updatedUser = {
          ...user,
          displayName: displayName || null,
          bio: bio || null,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        const errorText = await response.text();
        setUpdateError(errorText || 'Failed to update profile');
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditingProfile(false);
    setDisplayName(user?.displayName || '');
    setBio(user?.bio || '');
    setUpdateError('');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    // Confirm deletion with user
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const response = await apiRequest(`/User/${user.userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Clear localStorage and redirect
        localStorage.removeItem('user');
        logout();
        navigate('/login');
      } else {
        console.log('Failed to delete account:', response.status);
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-50 overflow-y-auto">
      {/* Main Content */}
      <div className="flex items-center justify-center p-8 min-h-full">
        <div className="w-full max-w-md">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-zinc-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-1">
              {displayName || user?.email || 'User'}
            </h1>
            <p className="text-zinc-600 text-sm mb-2">{user?.email}</p>
            {user?.isAdmin && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Profile Edit Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {!isEditingProfile ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Profile</h3>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
                
                {updateSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{updateSuccess}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Display Name
                    </label>
                    <p className="text-zinc-900">{displayName || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Bio
                    </label>
                    <p className="text-zinc-900">{bio || '—'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Edit Profile</h3>
                  <button
                    onClick={handleCancel}
                    className="text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {updateError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{updateError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 mb-2">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Sections */}
          <div className="space-y-2">
            {/* Theme Section */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('style')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 flex items-center justify-between transition-colors"
              >
                <span>Theme</span>
                {openSection === 'style' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === 'style' && (
                <div className="p-4 bg-white border-t border-zinc-200">
                  <div className="space-y-2">
                    <button className="w-full py-2 px-4 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-900 transition-colors font-medium">
                      Light Mode
                    </button>
                    <button className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors font-medium">
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
                <div className="p-4 bg-white border-t border-zinc-200">
                  <p className="text-sm text-zinc-600 mb-3">
                    Current email: <span className="font-medium text-zinc-900">{user?.email}</span>
                  </p>
                  <input
                    type="email"
                    placeholder="New email address"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
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
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
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

          {/* Delete Account Section */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg shadow-sm border border-red-200">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;