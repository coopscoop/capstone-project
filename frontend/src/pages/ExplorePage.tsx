import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '@/components/ProjectCard';

// api request utility
import { apiRequest } from '@/utils/api';

// models
import type { Post } from '@/models/Post';

const ExplorePage = () => {

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string>('');
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());

  const { setCurrentProject } = useProject();
  const navigate = useNavigate();

  // get projects from backend
  const loadPosts = async () => {
      setPostsLoading(true);
      setPostsError('');

      try {
          const response = await apiRequest('/Posts');
          if (response.ok) {
              const data: Post[] = await response.json();
              setPosts(data);
          }

      } catch (err) {
          setPostsError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
          setPostsLoading(false);
      }
  };

  const handleOpenInEditor = (post: Post) => {
    setCurrentProject(post);
    navigate('/editor');
  };

  // Load posts on load
  useEffect(() => {
      loadPosts();
  }, []);

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Search Bar */}
          <div className="mb-12 bg-white rounded-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search for projects..."
                className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((project, index) => (
            <ProjectCard
            key={index}
              postId={project.postId}
              title={project.title}
              tags={project.tags}
              description={project.description}
              favorited={project.postId in userFavorites}
              onOpen={() => {
                console.log(`Open project ${project.postId}, title: ${project.title}`);
                // open the project in the editor
                handleOpenInEditor(project);
              }}
            />
          ))}
        </div>

        </div>
      </div>
    </div>
  );
};

export default ExplorePage;