import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Code, Plus } from 'lucide-react';
import { useAuth, useProject } from '@/contexts';
import { useFavourites, usePosts } from '@/hooks';
import ProjectCard from '@/components/ProjectCard';
import { PostForm } from '@/components';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Post } from '@/types';

const HomePage = () => {
  const { user } = useAuth();
  const { setCurrentProject } = useProject();
  const { favourites, toggleFavourite } = useFavourites(user?.userId);
  const { posts, loading: postsLoading, error: postsError, createPost, updatePost, updatePostLikes, loadPosts } = usePosts();
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Get posts
  useEffect(() => {
    loadPosts();
  }, []);

  // Filter posts to only show favorites
  useEffect(() => {
    if (posts && favourites) {
      const filtered = posts.filter(post => favourites.has(post.postId));
      setFavoritePosts(filtered);
    }
  }, [posts, favourites]);

  const handleFavoriteToggle = async (postId: number, isFavorited: boolean) => {
    try {
      await toggleFavourite(postId, isFavorited, (increment) => {
        updatePostLikes(postId, increment);
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleOpenProject = (post: Post) => {
    setCurrentProject(post);
    window.location.href = '/editor';
  };

  const handleUpdatePost = async (postId: number, data: {
    title: string;
    description: string;
    code: string;
    isVisible: boolean;
    tags: string[];
  }) => {
    if (!user) return;

    try {
      // Find the post to get its current numberOfLikes
      const postToUpdate = posts.find(post => post.postId === postId);
      if (!postToUpdate) return;

      await updatePost(
        postId,
        user.userId,
        data.title,
        data.description,
        data.code,
        postToUpdate.numberOfLikes, // Use the current post's like count
        data.isVisible,
        data.tags
      );
    } catch (err) {
      console.error('Failed to update post:', err);
      throw err; // This will show error in the PostForm
    }
  };

  const handleCreatePost = async (data: {
    title: string;
    description: string;
    code: string;
    isVisible: boolean;
    tags: string[];
  }) => {
    if (!user) return;

    setFormLoading(true);
    setFormError('');

    try {
      const createdPost = await createPost(user.userId, data.title, data.description, data.code, data.isVisible, data.tags);
      
      if (createdPost && createdPost.postId) {
        await toggleFavourite(createdPost.postId, true);
      }
      
      setIsCreateModalOpen(false);
      setFormError('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-2xl mb-6">
            <img 
              src="/python-logo.png" 
              alt="Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Welcome to your dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center mb-8">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-6 py-3 bg-python-blue text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium">
                <Plus size={20} />
                Create New Project
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white **:data-dialog-close-btn:hidden">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-zinc-900">
                  Create New Project
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <PostForm
                  mode="create"
                  onSubmit={handleCreatePost}
                  onCancel={() => setIsCreateModalOpen(false)}
                  loading={formLoading}
                  error={formError}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Favorite Projects Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Star className="fill-yellow-300 stroke-yellow-300" size={28} />
              <h2 className="text-2xl font-bold text-zinc-900">Favorite Projects</h2>
            </div>
          </div>

          {postsLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900"></div>
                <p className="text-zinc-600">Loading your favorites...</p>
              </div>
            </div>
          ) : postsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 bg-red-50 p-4 rounded-lg">
                Error loading projects: {postsError}
              </p>
            </div>
          ) : favoritePosts.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto text-zinc-300 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">No favorites yet</h3>
              <p className="text-zinc-500 mb-6">
                Start exploring projects and add them to your favorites to see them here.
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
              >
                <Code size={20} />
                Explore Projects
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritePosts.map((post) => (
                <ProjectCard
                  key={post.postId}
                  postId={post.postId}
                  title={post.title}
                  tags={post.tags || []}
                  description={post.description || 'No description available'}
                  favorited={favourites.has(post.postId)}
                  userId={post.userId}
                  numberOfLikes={post.numberOfLikes}
                  onFavoriteToggle={handleFavoriteToggle}
                  onOpen={() => handleOpenProject(post)}
                  onUpdate={handleUpdatePost}
                  code={post.code}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;