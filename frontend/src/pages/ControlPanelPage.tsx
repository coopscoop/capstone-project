import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { usePosts } from '@/hooks/usePosts';
import { useFavourites } from '@/hooks/useFavourites';
import { useNavigate } from 'react-router-dom'; // Add this import
import { Shield, User, LogOut, Trash, Code, Plus, X, Edit } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import { PostForm } from '@/components/PostForm';
import { CodeExecutor } from '@/components/CodeExecutor';
import { CodeLinter } from '@/components/CodeLinter';
import type { Post } from '@/types';

const ControlPanelPage = () => {
    const { user, logout, clearTokens } = useAuth();
    const { posts, loading: postsLoading, error: postsError, createPost, updatePost, deletePost } = usePosts();
    const { favourites, toggleFavourite } = useFavourites(user?.userId);
    const { setCurrentProject } = useProject();
    const navigate = useNavigate(); // Add this hook
    
    // Form visibility state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    // Form loading/error states
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Handler for opening project in editor
    const handleOpenProject = (post: Post) => {
        setCurrentProject(post);
        navigate('/editor');
    };

    const handleCreatePost = async (data: {
        title: string;
        description: string;
        code: string;
        tags: string[];
    }) => {
        if (!user) return;

        setFormLoading(true);
        setFormError('');

        try {
            await createPost(user.userId, data.title, data.description, data.code, data.tags);
            setShowCreateForm(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to create post');
            throw err;
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdatePost = async (data: {
        title: string;
        description: string;
        code: string;
        tags: string[];
    }) => {
        if (!editingPost || !user) return;

        setFormLoading(true);
        setFormError('');

        try {
            await updatePost(
                editingPost.postId,
                user.userId,
                data.title,
                data.description,
                data.code,
                editingPost.numberOfLikes,
                data.tags
            );
            setEditingPost(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to update post');
            throw err;
        } finally {
            setFormLoading(false);
        }
    };

    const handleStartEdit = (post: Post) => {
        setEditingPost(post);
        setShowCreateForm(false);
        setFormError('');
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setFormError('');
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await deletePost(postId);
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    const handleFavoriteToggle = async (postId: number, isFavorited: boolean) => {
        try {
            await toggleFavourite(postId, isFavorited);
        } catch (err) {
            console.error('Error toggling favorite:', err);
            throw err;
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
                                onClick={clearTokens}
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
                        <PostForm
                            mode="create"
                            onSubmit={handleCreatePost}
                            onCancel={() => setShowCreateForm(false)}
                            loading={formLoading}
                            error={formError}
                        />
                    )}

                    {/* Edit Post Form */}
                    {editingPost && (
                        <PostForm
                            mode="edit"
                            initialData={{
                                title: editingPost.title,
                                description: editingPost.description || '',
                                code: editingPost.code,
                                tags: editingPost.tags || [],
                            }}
                            onSubmit={handleUpdatePost}
                            onCancel={handleCancelEdit}
                            loading={formLoading}
                            error={formError}
                        />
                    )}

                    {/* Posts Grid */}
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
                                        favorited={favourites.has(post.postId)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onOpen={() => handleOpenProject(post)} // Updated this line
                                        code={post.code}
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

                {/* Code Execution and Linting Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <CodeExecutor />
                    <CodeLinter />
                </div>
            </div>
        </div>
    );
};

export default ControlPanelPage;