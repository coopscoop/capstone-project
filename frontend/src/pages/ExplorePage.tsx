import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavourites, usePosts } from '@/hooks';
import ProjectCard from '@/components/ProjectCard';
import type { Post } from '@/types';

const ExplorePage = () => {
  const { user } = useAuth();
  const { setCurrentProject } = useProject();
  const { favourites, toggleFavourite } = useFavourites(user?.userId);
  const { posts, loading: postsLoading, error: postsError, updatePost, updatePostLikes, loadPosts } = usePosts();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // On page load get all posts
  useEffect(() => {
    loadPosts();
  }, []);

  // Filter posts based on search criteria
  useEffect(() => {
    if (!posts) return;

    let filtered = posts;

    // Apply all search filters
    if (searchFilters.length > 0) {
      filtered = posts.filter(post => {
        return searchFilters.every(filter => {
          const filterLower = filter.toLowerCase();
          const inTitle = post.title.toLowerCase().includes(filterLower);
          const inDescription = post.description?.toLowerCase().includes(filterLower) || false;
          const inTags = post.tags?.some(tag => tag.toLowerCase().includes(filterLower)) || false;
          
          return inTitle || inDescription || inTags;
        });
      });
    }

    setFilteredPosts(filtered);
  }, [posts, searchFilters]);

  const handleOpenInEditor = (post: Post) => {
    setCurrentProject(post);
    window.location.href = '/editor';
  };

  const handleFavoriteToggle = async (postId: number, isFavorited: boolean) => {
    try {
      await toggleFavourite(postId, isFavorited, (increment) => {
        // Update the like count locally
        updatePostLikes(postId, increment);
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
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
      const postToUpdate = posts.find(post => post.postId === postId);
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
    } catch (err) {
      console.error('Failed to update post:', err);
      throw err;
    }
  };

  const addSearchFilter = (filter: string) => {
    const trimmedFilter = filter.trim();
    if (trimmedFilter && !searchFilters.includes(trimmedFilter)) {
      setSearchFilters([...searchFilters, trimmedFilter]);
      setSearchTerm('');
    }
  };

  const removeSearchFilter = (filterToRemove: string) => {
    setSearchFilters(searchFilters.filter(filter => filter !== filterToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      addSearchFilter(searchTerm);
    } else if (e.key === 'Backspace' && searchTerm === '' && searchFilters.length > 0) {
      removeSearchFilter(searchFilters[searchFilters.length - 1]);
    }
  };

  const clearAllFilters = () => {
    setSearchFilters([]);
    setSearchTerm('');
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
            Explore Projects
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Discover code snippets and projects from the community. Find inspiration for your next project.
          </p>
        </div>

        {/* Simplified Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Search Projects</h2>
            {searchFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1"
              >
                <X size={16} />
                Clear all
              </button>
            )}
          </div>

          {/* Search Bar with Filter Bubbles */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>

            {/* Filter Bubbles */}
            {searchFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {searchFilters.map((filter) => (
                  <div
                    key={filter}
                    className="bg-python-yellow text-white px-4 py-2 rounded-lg text-sm font-semibold p-2 my-2"
                  >
                    <span>{filter}</span>
                    <button
                      onClick={() => removeSearchFilter(filter)}
                      className="hover:text-yellow-900 focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <span className="text-zinc-600 text-sm">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'project' : 'projects'} found
              {searchFilters.length > 0 ? ' matching your search' : ''}
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {postsLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900"></div>
                <p className="text-zinc-600">Loading projects...</p>
              </div>
            </div>
          ) : postsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 bg-red-50 p-4 rounded-lg">
                Error loading projects: {postsError}
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto text-zinc-300 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">
                {searchFilters.length > 0 ? 'No projects found' : 'No projects available'}
              </h3>
              <p className="text-zinc-500">
                {searchFilters.length > 0 
                  ? 'Try adjusting your search terms.'
                  : 'Check back later for new projects or create your own!'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
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
                  onOpen={() => handleOpenInEditor(post)}
                  onUpdate={handleUpdatePost}
                  code={post.code}
                  displayName={post.displayName}
                  isVisible={post.isVisible}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;