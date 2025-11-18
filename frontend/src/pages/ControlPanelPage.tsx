import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/utils/api';
import { Shield, User, LogOut, Trash, Code, Plus, X, Edit } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';

interface Post {
    postId: number;
    userId: number;
    title: string;
    description: string | null;
    numberOfLikes: number;
    code: string;
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
    const [adminResponse, setAdminResponse] = useState<string>('');
    const [adminError, setAdminError] = useState<string>('');
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
    const [newPostTags, setNewPostTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Edit post state
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editTags, setEditTags] = useState<string[]>([]);
    const [editTagInput, setEditTagInput] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    // Execution state
    const [codeInput, setCodeInput] = useState('print("Hello, World!")');
    const [executionOutput, setExecutionOutput] = useState('');
    const [executionLoading, setExecutionLoading] = useState(false);
    const [executionError, setExecutionError] = useState('');

    // Linting state
    const [lintInput, setLintInput] = useState('print("Hello, World!")');
    const [lintOutput, setLintOutput] = useState('');
    const [lintLoading, setLintLoading] = useState(false);
    const [lintError, setLintError] = useState('');

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
                // Load tags for each post
                const postsWithTags = await Promise.all(
                    data.slice(0, 4).map(async (post: Post) => {
                        try {
                            const tagsResponse = await apiRequest(`/tag/post/${post.postId}`, {
                                method: 'GET',
                            });
                            if (tagsResponse.ok) {
                                const tagsData = await tagsResponse.json();
                                return {
                                    ...post,
                                    tags: tagsData.map((t: any) => t.tagName)
                                };
                            }
                        } catch (err) {
                            console.error('Failed to load tags for post:', post.postId);
                        }
                        return { ...post, tags: [] };
                    })
                );
                setPosts(postsWithTags);
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
                const response = await apiRequest(`/favourite/${postId}/${user.userId}`, {
                    method: 'POST',
                });

                if (response.ok) {
                    setUserFavorites(prev => new Set(prev).add(postId));
                } else {
                    throw new Error('Failed to add favorite');
                }
            } else {
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

    // Tag management for create form
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const trimmedTag = tagInput.trim().toLowerCase();
            if (!newPostTags.includes(trimmedTag)) {
                setNewPostTags([...newPostTags, trimmedTag]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setNewPostTags(newPostTags.filter(tag => tag !== tagToRemove));
    };

    // Tag management for edit form
    const handleAddEditTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && editTagInput.trim()) {
            e.preventDefault();
            const trimmedTag = editTagInput.trim().toLowerCase();
            if (!editTags.includes(trimmedTag)) {
                setEditTags([...editTags, trimmedTag]);
            }
            setEditTagInput('');
        }
    };

    const handleRemoveEditTag = (tagToRemove: string) => {
        setEditTags(editTags.filter(tag => tag !== tagToRemove));
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setCreateLoading(true);
        setCreateError('');

        try {
            // Create the post
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
                const createdPost = await response.json();

                // Add tags to the post
                if (newPostTags.length > 0) {
                    await Promise.all(
                        newPostTags.map(tag =>
                            apiRequest(`/tag/${createdPost.postId}`, {
                                method: 'POST',
                                body: JSON.stringify({ tagName: tag }),
                            })
                        )
                    );
                }

                // Clear form
                setNewPostTitle('');
                setNewPostDescription('');
                setCode('');
                setNewPostTags([]);
                setTagInput('');
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

    const handleStartEdit = async (post: Post) => {
        setEditingPost(post);
        setEditTitle(post.title);
        setEditDescription(post.description || '');
        setEditCode(post.code);

        // Load current tags
        try {
            const tagsResponse = await apiRequest(`/tag/post/${post.postId}`, {
                method: 'GET',
            });
            if (tagsResponse.ok) {
                const tagsData = await tagsResponse.json();
                setEditTags(tagsData.map((t: any) => t.tagName));
            }
        } catch (err) {
            console.error('Failed to load tags:', err);
            setEditTags([]);
        }

        setEditTagInput('');
        setEditError('');
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setEditTitle('');
        setEditDescription('');
        setEditCode('');
        setEditTags([]);
        setEditTagInput('');
        setEditError('');
    };

    const handleUpdatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost || !user) return;

        setEditLoading(true);
        setEditError('');

        try {
            // Update the post
            const response = await apiRequest(`/Posts/${editingPost.postId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    postId: editingPost.postId,
                    userId: user.userId,
                    title: editTitle,
                    description: editDescription,
                    code: editCode,
                    numberOfLikes: editingPost.numberOfLikes,
                }),
            });

            if (response.ok) {
                // Delete all existing tags
                await apiRequest(`/tag/post/${editingPost.postId}`, {
                    method: 'DELETE',
                });

                // Add new tags
                if (editTags.length > 0) {
                    await Promise.all(
                        editTags.map(tag =>
                            apiRequest(`/tag/${editingPost.postId}`, {
                                method: 'POST',
                                body: JSON.stringify({ tagName: tag }),
                            })
                        )
                    );
                }

                // Clear edit form
                handleCancelEdit();

                // Reload posts
                await loadPosts();
            } else {
                const errorText = await response.text();
                setEditError(`Failed to update post: ${errorText}`);
            }
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Failed to update post');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await apiRequest(`/Posts/${postId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPosts(prev => prev.filter(p => p.postId !== postId));
            } else {
                alert('Failed to delete post');
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post');
        }
    };

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
                setAdminResponse(`Admin access granted! Retrieved ${data.length} users`);
            } else if (response.status === 403) {
                setAdminError('Access denied: Admin privileges required (403 Forbidden)');
            } else if (response.status === 401) {
                setAdminError('Unauthorized: Your session may have expired');
            } else {
                setAdminError(`Error: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            if (err instanceof Error && err.message === 'Unauthorized') {
                setAdminError('Session expired - please log in again');
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

    const handleExecuteCode = async () => {
        setExecutionLoading(true);
        setExecutionError('');
        setExecutionOutput('');

        try {
            const response = await apiRequest('/Code/execute', {
                method: 'POST',
                body: JSON.stringify({
                    code: codeInput,
                    runLinter: false,
                    timeoutSeconds: 30
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setExecutionOutput(JSON.stringify(data, null, 2));
            } else {
                const errorText = await response.text();
                setExecutionError(`Failed to execute code: ${errorText}`);
            }
        } catch (err) {
            setExecutionError(err instanceof Error ? err.message : 'Failed to execute code');
        } finally {
            setExecutionLoading(false);
        }
    };

    const handleLintCode = async () => {
        setLintLoading(true);
        setLintError('');
        setLintOutput('');

        try {
            const response = await apiRequest('/Code/lint', {
                method: 'POST',
                body: JSON.stringify({
                    code: lintInput,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setLintOutput(JSON.stringify(data, null, 2));
            } else {
                const errorText = await response.text();
                setLintError(`Failed to lint code: ${errorText}`);
            }
        } catch (err) {
            setLintError(err instanceof Error ? err.message : 'Failed to lint code');
        } finally {
            setLintLoading(false);
        }
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
                                    {user?.isAdmin ? 'Admin' : 'Regular User'}
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
                        {!editingPost && (
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {showCreateForm ? <X size={18} /> : <Plus size={18} />}
                                {showCreateForm ? 'Cancel' : 'Create Post'}
                            </button>
                        )}
                    </div>

                    {/* Create Post Form */}
                    {showCreateForm && !editingPost && (
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
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Type a tag and press Enter"
                                    />
                                    <p className="text-xs text-zinc-400 mt-1">Press Enter to add a tag</p>
                                    {newPostTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {newPostTags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 bg-python-yellow text-white px-3 py-1 rounded-lg text-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:text-red-200"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Code
                                    </label>
                                    <textarea
                                        value={newCode}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                        placeholder="print('Hello, World!')"
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

                    {/* Edit Post Form */}
                    {editingPost && (
                        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Edit Post</h3>
                            <form onSubmit={handleUpdatePost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
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
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                        placeholder="A brief description of your project"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={editTagInput}
                                        onChange={(e) => setEditTagInput(e.target.value)}
                                        onKeyDown={handleAddEditTag}
                                        className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Type a tag and press Enter"
                                    />
                                    <p className="text-xs text-zinc-400 mt-1">Press Enter to add a tag</p>
                                    {editTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {editTags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 bg-python-yellow text-white px-3 py-1 rounded-lg text-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEditTag(tag)}
                                                        className="hover:text-red-200"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Code
                                    </label>
                                    <textarea
                                        value={editCode}
                                        onChange={(e) => setEditCode(e.target.value)}
                                        className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                        placeholder="print('Hello, World!')"
                                        required
                                    />
                                </div>

                                {editError && (
                                    <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                                        <p className="text-sm text-red-300">{editError}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editLoading ? 'Updating...' : 'Update Post'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex-1 px-4 py-3 bg-zinc-600 text-white rounded-lg hover:bg-zinc-500 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
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
                                    {/* Action buttons - only show if user owns the post */}
                                    {user?.userId === post.userId && (
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleStartEdit(post)}
                                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                title="Edit post"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.postId)}
                                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                title="Delete post"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Code Execution Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Code Execution */}
                    <div className="bg-zinc-700 rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Code className="text-green-400" size={24} />
                            <h3 className="text-lg font-semibold text-zinc-200">Code Execution</h3>
                        </div>
                        <p className="text-sm text-zinc-300 mb-4">
                            Execute Python code and see the results.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Python Code
                                </label>
                                <textarea
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                                    placeholder="print('Hello, World!')"
                                />
                            </div>

                            <button
                                onClick={handleExecuteCode}
                                disabled={executionLoading}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {executionLoading ? 'Executing...' : 'Execute Code'}
                            </button>

                            {executionOutput && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Output
                                    </label>
                                    <pre className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-green-300 font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                                        {executionOutput}
                                    </pre>
                                </div>
                            )}

                            {executionError && (
                                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                                    <p className="text-sm text-red-300">{executionError}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Code Linting */}
                    <div className="bg-zinc-700 rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Code className="text-yellow-400" size={24} />
                            <h3 className="text-lg font-semibold text-zinc-200">Code Linting</h3>
                        </div>
                        <p className="text-sm text-zinc-300 mb-4">
                            Lint Python code to check for issues.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Python Code
                                </label>
                                <textarea
                                    value={lintInput}
                                    onChange={(e) => setLintInput(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-[120px]"
                                    placeholder="print('Hello, World!')"
                                />
                            </div>

                            <button
                                onClick={handleLintCode}
                                disabled={lintLoading}
                                className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {lintLoading ? 'Linting...' : 'Lint Code'}
                            </button>

                            {lintOutput && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Lint Results
                                    </label>
                                    <pre className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-yellow-300 font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                                        {lintOutput}
                                    </pre>
                                </div>
                            )}

                            {lintError && (
                                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                                    <p className="text-sm text-red-300">{lintError}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admin Endpoint Test */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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