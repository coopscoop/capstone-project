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
  const { posts, loading: postsLoading, error: postsError } = usePosts();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // Filter posts based on search criteria
  useEffect(() => {
    if (!posts) return;

    let filtered = posts;

    // Filter by search term (title, description, tags)
    if (searchTerm.trim() || searchTags.length > 0) {
      filtered = posts.filter(post => {
        const searchLower = searchTerm.toLowerCase();
        const inTitle = post.title.toLowerCase().includes(searchLower);
        const inDescription = post.description?.toLowerCase().includes(searchLower) || false;
        const inTags = post.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false;
        
        // Check if post matches search term
        const matchesSearchTerm = searchTerm.trim() === '' || inTitle || inDescription || inTags;
        
        // Check if post matches all selected tags
        const matchesTags = searchTags.length === 0 || 
          searchTags.every(searchTag => 
            post.tags?.some(postTag => 
              postTag.toLowerCase().includes(searchTag.toLowerCase())
            )
          );

        return matchesSearchTerm && matchesTags;
      });
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, searchTags]);

  const handleOpenInEditor = (post: Post) => {
    setCurrentProject(post);
    window.location.href = '/editor';
  };

  const handleFavoriteToggle = async (postId: number, isFavorited: boolean) => {
    try {
      await toggleFavourite(postId, isFavorited);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const addSearchTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !searchTags.includes(trimmedTag)) {
      setSearchTags([...searchTags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const removeSearchTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addSearchTag(currentTag);
    } else if (e.key === 'Backspace' && currentTag === '' && searchTags.length > 0) {
      removeSearchTag(searchTags[searchTags.length - 1]);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchTags([]);
    setCurrentTag('');
  };

  // Get all unique tags from posts for suggestions
  const allTags = Array.from(new Set(posts?.flatMap(post => post.tags || []) || [])).sort();

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

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">Search Projects</h2>
            {(searchTerm || searchTags.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
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
                className="w-full pl-12 pr-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tag Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Filter by Tags
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-zinc-300 rounded-lg focus-within:ring-2 focus-within:ring-zinc-900 focus-within:border-transparent">
              {/* Selected Tags */}
              {searchTags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeSearchTag(tag)}
                    className="hover:text-blue-900 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {/* Tag Input */}
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchTags.length === 0 ? "Add tags to filter..." : ""}
                className="flex-1 min-w-[120px] outline-none bg-transparent"
              />
            </div>
            
            {/* Tag Suggestions */}
            {currentTag && allTags.length > 0 && (
              <div className="mt-2 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {allTags
                  .filter(tag => 
                    tag.toLowerCase().includes(currentTag.toLowerCase()) && 
                    !searchTags.includes(tag)
                  )
                  .slice(0, 5)
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => addSearchTag(tag)}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-50 rounded-md text-sm"
                    >
                      {tag}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'project' : 'projects'} found
              {searchTerm || searchTags.length > 0 ? ' matching your search' : ''}
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
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
                {searchTerm || searchTags.length > 0 ? 'No projects found' : 'No projects available'}
              </h3>
              <p className="text-zinc-500">
                {searchTerm || searchTags.length > 0 
                  ? 'Try adjusting your search terms or filters.'
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
                  onFavoriteToggle={handleFavoriteToggle}
                  onOpen={() => handleOpenInEditor(post)}
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

export default ExplorePage;