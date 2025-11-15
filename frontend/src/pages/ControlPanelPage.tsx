import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/utils/api';
import { Shield, User, LogOut, CheckCircle, Trash, Code, Plus, X } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';

interface Post {
  postId: number;
  userId: number;
  title: string;
  description: string | null;
  numberOfLikes: number;
  fileLocation: string;
  created: string;
  lastEdited: string;
  tags?: string[];
}

interface Favourite {
  postId: number;
  userId: number;
}

const ControlPanelPage = () => {
  const { user, logout } = useAuth();
  const [publicResponse, setPublicResponse] = useState<string>('');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [publicError, setPublicError] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [publicLoading, setPublicLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string>('');
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());

  // Create post state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newCode, setCode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Load posts and favorites on mount
  useEffect(() => {
    loadPosts();
    if (user) {
      loadUserFavorites();
    }
  }, [user]);

  const loadPosts = async () => {
    setPostsLoading(true);
    setPostsError('');

    try {
      const response = await apiRequest('/Posts', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Only show first 4 posts
        setPosts(data.slice(0, 4));
      } else {
        setPostsError(`Failed to load posts: ${response.status}`);
      }
    } catch (err) {
      setPostsError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    if (!user) return;

    try {
      const response = await apiRequest(`/favourite/user/${user.userId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data: Favourite[] = await response.json();
        const favoritePostIds = new Set(data.map((fav) => fav.postId));
        setUserFavorites(favoritePostIds);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const handleFavoriteToggle = async (postId: number, isFavorited: boolean) => {
    if (!user) return;

    try {
      if (isFavorited) {
        // Add favorite
        const response = await apiRequest(`/favourite/${postId}/${user.userId}`, {
          method: 'POST',
        });

        if (response.ok) {
          setUserFavorites(prev => new Set(prev).add(postId));
        } else {
          throw new Error('Failed to add favorite');
        }
      } else {
        // Remove favorite
        const response = await apiRequest(`/favourite/${postId}/${user.userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUserFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        } else {
          throw new Error('Failed to remove favorite');
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreateLoading(true);
    setCreateError('');

    try {
      const response = await apiRequest('/Posts', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.userId,
          title: newPostTitle,
          description: newPostDescription,
          code: newCode,
          numberOfLikes: 0,
        }),
      });

      if (response.ok) {
        // Clear form
        setNewPostTitle('');
        setNewPostDescription('');
        setCode('');
        setShowCreateForm(false);
        
        // Reload posts
        await loadPosts();
      } else {
        const errorText = await response.text();
        setCreateError(`Failed to create post: ${errorText}`);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await apiRequest(`/post/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setPosts(prev => prev.filter(p => p.postId !== postId));
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  // Test public endpoint
  const testPublicEndpoint = async () => {
    setPublicError('');
    setPublicResponse('');
    setPublicLoading(true);

    try {
      const response = await apiRequest('/post', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setPublicResponse(`✓ Success! Retrieved ${data.length} posts`);
      } else {
        setPublicError(`✗ Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setPublicError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setPublicLoading(false);
    }
  };

  // Test admin-only endpoint
  const testAdminEndpoint = async () => {
    setAdminError('');
    setAdminResponse('');
    setAdminLoading(true);

    try {
      const response = await apiRequest('/user', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setAdminResponse(`✓ Admin access granted! Retrieved ${data.length} users`);
      } else if (response.status === 403) {
        setAdminError('✗ Access denied: Admin privileges required (403 Forbidden)');
      } else if (response.status === 401) {
        setAdminError('✗ Unauthorized: Your session may have expired');
      } else {
        setAdminError(`✗ Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        setAdminError('✗ Session expired - please log in again');
      } else {
        setAdminError(err instanceof Error ? err.message : 'Request failed');
      }
    } finally {
      setAdminLoading(false);
    }
  };

  const deleteJwtToken = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-800 to-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-zinc-700 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-zinc-200">Auth Control Panel</h1>
            <div className="flex gap-3">
              <button
                onClick={deleteJwtToken}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-500 transition-colors"
              >
                <Trash size={18} />
                Clear Tokens
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              {user?.isAdmin ? (
                <Shield className="text-purple-400" size={24} />
              ) : (
                <User className="text-blue-400" size={24} />
              )}
              <h2 className="text-xl font-semibold text-zinc-200">
                {user?.isAdmin ? 'Admin User' : 'Regular User'}
              </h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-zinc-400 w-32">User ID:</span>
                <span className="text-zinc-200">{user?.userId}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-zinc-400 w-32">Email:</span>
                <span className="text-zinc-200">{user?.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-zinc-400 w-32">Display Name:</span>
                <span className="text-zinc-200">{user?.displayName || 'Not set'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-zinc-400 w-32">Admin Status:</span>
                <span className={`font-medium ${user?.isAdmin ? 'text-purple-400' : 'text-blue-400'}`}>
                  {user?.isAdmin ? '✓ Admin' : '✗ Regular User'}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-zinc-400 w-32">Account Created:</span>
                <span className="text-zinc-200">
                  {user?.timeCreated ? new Date(user.timeCreated).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-zinc-700 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Code className="text-blue-400" size={24} />
              <h2 className="text-2xl font-bold text-zinc-200">Recent Projects</h2>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showCreateForm ? <X size={18} /> : <Plus size={18} />}
              {showCreateForm ? 'Cancel' : 'Create Post'}
            </button>
          </div>

          {/* Create Post Form */}
          {showCreateForm && (
            <div className="bg-zinc-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4">Create New Post</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Awesome Project"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPostDescription}
                    onChange={(e) => setNewPostDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="A brief description of your project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    File Location
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/projects/my-project.py"
                    required
                  />
                </div>

                {createError && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{createError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Creating...' : 'Create Post'}
                </button>
              </form>
            </div>
          )}

          {postsLoading ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">Loading posts...</p>
            </div>
          ) : postsError ? (
            <div className="text-center py-8">
              <p className="text-red-400">{postsError}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">No posts found. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.postId} className="relative group">
                  <ProjectCard
                    postId={post.postId}
                    title={post.title}
                    tags={post.tags || ['Python']}
                    description={post.description || 'No description available'}
                    favorited={userFavorites.has(post.postId)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onOpen={() => console.log('Open project:', post.postId)}
                  />
                  {/* Delete button - only show if user owns the post */}
                  {user?.userId === post.userId && (
                    <button
                      onClick={() => handleDeletePost(post.postId)}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete post"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Endpoint Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-700 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-purple-400" size={24} />
              <h3 className="text-lg font-semibold text-zinc-200">Admin Only Endpoint</h3>
            </div>
            <p className="text-sm text-zinc-300 mb-4">
              This endpoint requires admin privileges. Regular users will see an error.
            </p>
            <button
              onClick={testAdminEndpoint}
              disabled={adminLoading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adminLoading ? 'Testing...' : 'Test GET /api/user (Admin Only)'}
            </button>

            {adminResponse && (
              <div className="p-3 bg-purple-900/30 border border-purple-700 rounded-lg">
                <p className="text-sm text-purple-300">{adminResponse}</p>
              </div>
            )}
            {adminError && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-sm text-red-300">{adminError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanelPage;