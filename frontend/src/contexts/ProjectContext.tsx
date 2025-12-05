import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Post } from '@/types';

interface ProjectContextType {
  currentProject: Post | null;
  setCurrentProject: (project: Post) => void;
  clearCurrentProject: () => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load project from localStorage on mount
  useEffect(() => {
    const savedProject = localStorage.getItem('currentProject');
    if (savedProject) {
      try {
        setCurrentProjectState(JSON.parse(savedProject));
      } catch (err) {
        console.error('Failed to parse saved project:', err);
        localStorage.removeItem('currentProject');
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for storage changes, gets triggered when user logs out
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentProject' && e.newValue === null) {
        setCurrentProjectState(null);
      } else if (e.key === 'accessToken' && e.newValue === null) {
        // Clear project when user logs out
        setCurrentProjectState(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setCurrentProject = (project: Post) => {
    setCurrentProjectState(project);
    localStorage.setItem('currentProject', JSON.stringify(project));
  };

  const clearCurrentProject = () => {
    setCurrentProjectState(null);
    localStorage.removeItem('currentProject');
  };

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject, clearCurrentProject, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};