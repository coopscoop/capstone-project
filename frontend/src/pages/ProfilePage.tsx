import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, KeyRound, Edit, Save, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { apiRequest } from "@/utils/api";
import ProjectCard from "@/components/ProjectCard";
import { usePosts, useUserPostsWithFavorites } from "@/hooks";
import type { Post } from "@/types";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { setCurrentProject } = useProject();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // const { userPosts, loading: postsLoading, error: postsError, getUserPosts, updatePost, updatePostLikes } = usePosts();
  const { 
  posts: userPostsWithFavorites, 
  loading: postsLoading, 
  error: postsError, 
  refetch: fetchUserPosts, 
  toggleFavorite 
} = useUserPostsWithFavorites(user?.userId);
  const { updatePost } = usePosts();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const handleFavoriteToggle = async (postId: number, isFavorited: boolean) => {
    try {
      await toggleFavorite(postId, isFavorited);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handlePasswordReset = () => {
    navigate("/reset-password");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const response = await apiRequest(`/User/${user.userId}`, {
        method: "PUT",
        body: JSON.stringify({
          displayName: displayName || null,
          bio: bio || null,
        }),
      });

      if (response.ok) {
        setUpdateSuccess("Profile updated successfully!");
        setIsEditingProfile(false);

        // Update user in localStorage
        const updatedUser = {
          ...user,
          displayName: displayName || null,
          bio: bio || null,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(""), 3000);
      } else {
        const errorText = await response.text();
        setUpdateError(errorText || "Failed to update profile");
      }
    } catch (err) {
      setUpdateError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditingProfile(false);
    setDisplayName(user?.displayName || "");
    setBio(user?.bio || "");
    setUpdateError("");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const response = await apiRequest(`/User/${user.userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        localStorage.removeItem("user");
        logout();
        navigate("/login");
      } else {
        console.log("Failed to delete account:", response.status);
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

 const handleOpenInEditor = (post: Post) => {
    setCurrentProject(post);
    window.location.href = '/editor';
  };

  const handleUpdatePost = async (
    postId: number,
    data: {
      title: string;
      description: string;
      code: string;
      isVisible: boolean;
      tags: string[];
    }
  ) => {
    if (!user) return;

    try {
      const postToUpdate = userPostsWithFavorites.find((post) => post.postId === postId);
      if (!postToUpdate) return;

      await updatePost(
        postId,
        user.userId,
        data.title,
        data.description,
        data.code,
        postToUpdate.numberOfLikes,
        data.isVisible,
        data.tags
      );

      // Refresh the user posts after update
      fetchUserPosts();
    } catch (err) {
      console.error("Failed to update post:", err);
      throw err;
    }
  };

  return (
    <div className="w-full h-full bg-zinc-50 overflow-y-auto">
      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-full">
        <div className="w-full max-w-2xl">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-zinc-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-1">
              {displayName || user?.email || "User"}
            </h1>
            <p className="text-zinc-600 text-sm mb-2">{user?.email}</p>
            {user?.isAdmin && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Profile & Account Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">
                Profile Information
              </h2>
            </div>

            {updateSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{updateSuccess}</p>
              </div>
            )}

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Editable Profile Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Display Name
                    </label>
                    <p className="text-zinc-900 text-lg">
                      {displayName || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Bio
                    </label>
                    <p className="text-zinc-900">{bio || "—"}</p>
                  </div>
                </div>

                {/* Uneditable Account Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      User ID
                    </label>
                    <p className="text-zinc-900 font-mono text-sm">
                      {user?.userId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Account Created
                    </label>
                    <p className="text-zinc-900">
                      {user?.timeCreated
                        ? new Date(user.timeCreated).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Account Type
                    </label>
                    <p
                      className={`font-medium ${
                        user?.isAdmin ? "text-purple-600" : "text-blue-600"
                      }`}
                    >
                      {user?.isAdmin ? "Administrator" : "Standard User"}
                    </p>
                  </div>
                </div>
                {!isEditingProfile && (
                  <button className="flex items-center gap-2 px-6 py-3 bg-python-blue text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium">
                    <Edit size={20} />
                    Update Profile Settings
                  </button>
                )}
              </div>
            ) : (
              <div>
                {updateError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{updateError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
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
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
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

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {isUpdating ? "Saving..." : "Save Changes"}
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

          {/* Password Reset Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Password
            </h2>
            <p className="text-zinc-600 text-sm mb-4">
              Update your password to keep your account secure
            </p>
            <button
              onClick={handlePasswordReset}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-python-blue text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
            >
              <KeyRound size={20} />
              Change Your Password
            </button>
          </div>

          {/* Your Posts Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-zinc-900" />
              <h2 className="text-xl font-semibold text-zinc-900">
                Your Posts
              </h2>
            </div>

            {postsLoading ? (
              <div className="text-center py-8">
                <p className="text-zinc-600">Loading your posts...</p>
              </div>
            ) : postsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 bg-red-50 p-4 rounded-lg">
                  Error loading posts: {postsError}
                </p>
              </div>
            ) : userPostsWithFavorites.length > 0 ? (
              <div className="grid gap-4">
                {userPostsWithFavorites.map((post) => (
                  <ProjectCard
                    key={post.postId}
                    postId={post.postId}
                    title={post.title}
                    tags={post.tags || []}
                    description={post.description || "No description available"}
                    favorited={post.isFavorited}
                    userId={post.userId}
                    numberOfLikes={post.numberOfLikes}
                    onFavoriteToggle={handleFavoriteToggle}
                    onOpen={() => handleOpenInEditor(post)}
                    onUpdate={handleUpdatePost}
                    code={post.code}
                    displayName={displayName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-600 mb-4">
                  You haven't created any posts yet.
                </p>
                <button
                  onClick={() => navigate("/create-post")}
                  className="px-4 py-2 bg-python-blue hover:bg-zinc-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Create Your First Post
                </button>
              </div>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="mt-6 p-6 bg-red-50 rounded-lg shadow-sm border border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Account Deletion
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
