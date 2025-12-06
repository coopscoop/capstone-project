import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, KeyRound, Edit, Save, FileText, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { apiRequest } from "@/utils/api";
import ProjectCard from "@/components/ProjectCard";
import { usePosts, useUserPostsWithFavorites } from "@/hooks";
import type { Post } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { setCurrentProject } = useProject();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { 
    posts: userPostsWithFavorites, 
    loading: postsLoading, 
    error: postsError, 
    refetch: fetchUserPosts, 
    toggleFavorite 
  } = useUserPostsWithFavorites(user?.userId);
  const { updatePost, deletePost } = usePosts();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

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

  const toggleEditing = () => {
    setIsEditingProfile(!isEditingProfile);
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

        // Update user in context
        setDisplayName(updatedUser.displayName || "");
        setBio(updatedUser.bio || "");

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

  const handleDeletePost = async (postId: number) => {
    if (!user) return;
    
    try {
      await deletePost(postId);
      
      // reload the page to remove the post from state
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete post:', err);
      throw err;
    }
  };

  const handleCancel = () => {
    setIsEditingProfile(false);
    setDisplayName(user?.displayName || "");
    setBio(user?.bio || "");
    setUpdateError("");
  };

  // not in a hook but its only used once? no real reason to have a user hook?
  const handleDeleteAccount = async () => {
    if (!user) return;

    if (deleteConfirmation !== "CONFIRM") {
      setUpdateError("Please type 'CONFIRM' to delete your account");
      return;
    }

    try {
      const response = await apiRequest(`/User/${user.userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        localStorage.removeItem("user");
        logout();
        navigate("/login");
      } else {
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteConfirmation("");
    setUpdateError("");
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmation("");
    setUpdateError("");
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

      
      const updatedPost = await updatePost(
        postId,
        user.userId,
        data.title,
        data.description,
        data.code,
        postToUpdate.numberOfLikes,
        data.isVisible,
        data.tags
      );


      // If still undefined, force refresh
      if (!updatedPost) {
        await fetchUserPosts();
      }

    } catch (err) {
      console.error("Failed to update post:", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-2xl mb-6">
            <User size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">
            {displayName || user?.email || "User"}
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Manage your profile and account settings
          </p>
          {user?.isAdmin && (
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mt-2">
              Administrator
            </span>
          )}
        </div>


        {/* Profile & Account Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">
              Profile Information
            </h2>
          </div>

          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{updateSuccess}</p>
            </div>
          )}

          {!isEditingProfile ? (
            <div className="space-y-6">
              {/* Profile Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editable Profile Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      DISPLAY NAME
                    </label>
                    <p className="text-zinc-900 text-lg font-medium">
                      {displayName || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      BIO
                    </label>
                    <p className="text-zinc-900 leading-relaxed">{bio || "—"}</p>
                  </div>
                </div>

                {/* Uneditable Account Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      USER ID
                    </label>
                    <p className="text-zinc-900 font-mono text-lg">
                      {user?.userId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      ACCOUNT CREATED
                    </label>
                    <p className="text-zinc-900 text-lg">
                      {user?.timeCreated
                        ? new Date(user.timeCreated).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      ACCOUNT TYPE
                    </label>
                    <p
                      className={`text-lg font-medium ${
                        user?.isAdmin ? "text-purple-600" : "text-blue-600"
                      }`}
                    >
                      {user?.isAdmin ? "Administrator" : "Standard User"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <div className="pt-6">
                <button 
                  onClick={toggleEditing}
                  className="w-full flex items-center justify-center gap-3 bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <Edit size={20} />
                  Update Profile Settings
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {updateError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{updateError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="text-sm font-medium text-zinc-700">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="text-sm font-medium text-zinc-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                    />
                  </div>
                </div>
                
                {/* Account Info remains visible during editing */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      USER ID
                    </label>
                    <p className="text-zinc-900 font-mono text-lg">
                      {user?.userId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      ACCOUNT CREATED
                    </label>
                    <p className="text-zinc-900 te
            <div className=xt-lg">
                      {user?.timeCreated
                        ? new Date(user.timeCreated).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                      ACCOUNT TYPE
                    </label>
                    <p
                      className={`text-lg font-medium ${
                        user?.isAdmin ? "text-purple-600" : "text-blue-600"
                      }`}
                    >
                      {user?.isAdmin ? "Administrator" : "Standard User"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password Reset Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <KeyRound size={28} className="text-zinc-900" />
            <h2 className="text-2xl font-bold text-zinc-900">
              Password
            </h2>
          </div>
          <p className="text-zinc-600 mb-6">
            Update your password to keep your account secure
          </p>
          <button
            onClick={handlePasswordReset}
            className="w-full flex items-center justify-center gap-3 bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <KeyRound size={20} />
            Change Your Password
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="bg-red-50 rounded-2xl shadow-lg p-8 mb-8 border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-xl font-bold text-red-900">
              Account Deletion
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={openDeleteModal}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Delete Account
          </button>
        </div>
        
        {/* Your Posts Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FileText size={28} className="text-zinc-900" />
            <h2 className="text-2xl font-bold text-zinc-900">
              Your Posts
            </h2>
          </div>

          {postsLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900"></div>
                <p className="text-zinc-600">Loading your posts...</p>
              </div>
            </div>
          ) : postsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 bg-red-50 p-4 rounded-lg">
                Error loading posts: {postsError}
              </p>
            </div>
          ) : userPostsWithFavorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPostsWithFavorites.map((post) => (
                <ProjectCard
                  key={post.postId}
                  postId={post.postId}
                  title={post.title}
                  tags={post.tags}
                  description={post.description || "No description available"}
                  favorited={post.isFavorited}
                  userId={post.userId}
                  numberOfLikes={post.numberOfLikes}
                  onFavoriteToggle={handleFavoriteToggle}
                  onOpen={() => handleOpenInEditor(post)}
                  onUpdate={handleUpdatePost}
                  code={post.code}
                  displayName={displayName}
                  isVisible={post.isVisible}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto text-zinc-300 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">No posts yet</h3>
              <p className="text-zinc-500 mb-6">
                Start creating projects to see them appear here.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <FileText size={20} />
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-zinc-200">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <DialogTitle className="text-red-900">Delete Account</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-700">
              This action cannot be undone. This will permanently delete your account and remove all your data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="confirm-delete" className="text-sm font-medium text-zinc-700">
                Type <span className="font-mono text-red-600">CONFIRM</span> to continue:
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={deleteConfirmation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteConfirmation(e.target.value)}
                placeholder="CONFIRM"
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            {updateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{updateError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "CONFIRM"}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Account
            </button>
            <button
              onClick={closeDeleteModal}
              className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;