import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Code } from 'lucide-react';
import { useAuth, useProject } from '@/contexts';
import { useFavourites, usePosts } from '@/hooks';
import ProjectCard from '@/components/ProjectCard';
import type { Post } from '@/types';

const HomePage = () => {
  const { user } = useAuth();
  const { setCurrentProject } = useProject();
  const { favourites, toggleFavourite } = useFavourites(user?.userId);
  const { posts, loading: postsLoading, error: postsError } = usePosts();
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);

  // Filter posts to only show favorites
  useEffect(() => {
    if (posts && favourites) {
      const filtered = posts.filter(post => favourites.has(post.postId));
      setFavoritePosts(filtered);
    }
  }, [posts, favourites]);

  const handleFavoriteToggle = async (postId: number, isFavorited: boolean) => {
    try {
      await toggleFavourite(postId, isFavorited);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleOpenProject = (post: Post) => {
    setCurrentProject(post);
    // Navigate to editor or project view
    window.location.href = '/editor';
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

        {/* Favorite Projects Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Star className="stroke-yellow-300" size={28} />
              <h2 className="text-2xl font-bold text-zinc-900">Favorite Projects</h2>
            </div>
            <span className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full text-sm font-medium">
              {favoritePosts.length} {favoritePosts.length === 1 ? 'project' : 'projects'}
            </span>
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
                  onFavoriteToggle={handleFavoriteToggle}
                  onOpen={() => handleOpenProject(post)}
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