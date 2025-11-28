import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Editor } from '@monaco-editor/react';

interface ProjectCardProps {
  postId: number;
  title?: string;
  tags?: string[];
  description?: string;
  favorited?: boolean;
  code?: string;
  onFavoriteToggle?: (postId: number, isFavorited: boolean) => Promise<void>;
  onOpen?: () => void;
}

const ProjectCard = ({ 
  postId,
  title = "Project Title",
  tags = ["tags"],
  description = "A description of the project",
  favorited: initialFavorited = false,
  code,
  onFavoriteToggle,
  onOpen = () => {},
}: ProjectCardProps) => {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [editorHeight, setEditorHeight] = useState('200px');
  const editorRef = useRef<any>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const openProjectButtonRef = useRef<HTMLButtonElement>(null);

  const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    const newFavoritedState = !favorited;
    
    try {
      if (onFavoriteToggle) {
        await onFavoriteToggle(postId, newFavoritedState);
      }
      setFavorited(newFavoritedState);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleOpenClick = () => {
    // Had to add a slight delay to ensure modal opens correctly and shadcn can focus properly
    setTimeout(() => {
      setIsModalOpen(true);
    }, 10);
  };

  const handleOpenProject = () => {
    setIsModalOpen(false);
    onOpen();
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Force layout after mount
    setTimeout(() => {
      editor.layout();
    }, 0);
  };

  // Update editor height based on screen size
  useEffect(() => {
    const updateEditorHeight = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setEditorHeight('150px');
      } else {
        setEditorHeight('200px');
      }
    };

    updateEditorHeight();
    window.addEventListener('resize', updateEditorHeight);
    
    return () => window.removeEventListener('resize', updateEditorHeight);
  }, []);

  // Handle resize when modal opens and for general responsiveness
  useEffect(() => {
    if (isModalOpen && editorRef.current) {
      const updateLayout = () => {
        requestAnimationFrame(() => {
          if (editorRef.current) {
            editorRef.current.layout();
          }
        });
      };

      updateLayout();
      
      // Use ResizeObserver for container changes
      if (dialogContentRef.current) {
        const resizeObserver = new ResizeObserver(updateLayout);
        resizeObserver.observe(dialogContentRef.current);
        
        return () => {
          resizeObserver.disconnect();
        };
      }
    }
  }, [isModalOpen]);

  return (
    <div className="bg-zinc-700 rounded-lg shadow-md p-6 border border-zinc-600 hover:shadow-lg transition-shadow">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-zinc-100 flex-1 truncate pr-2">
          {title} - {postId}
        </h3>

        <button 
          onClick={toggleFavorite}
          disabled={isTogglingFavorite}
          className="shrink-0 text-yellow-400 hover:scale-110 transition-transform disabled:opacity-50"
          aria-label={favorited ? "Unfavorite" : "Favorite"}
        >
          <Star size={28} fill={favorited ? "currentColor" : "none"} strokeWidth={2} />
        </button>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        {tags.slice(0, 2).map((tag, index) => (
          <span 
            key={index}
            className="bg-python-yellow text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
        {tags.length > 2 && <span className="text-zinc-400 self-center">...</span>}
      </div>

      {/* Description */}
      <p className="text-zinc-300 mb-6 text-base leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Open Button */}
      <button 
        ref={openProjectButtonRef}
        onClick={handleOpenClick}
        className="w-full bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Open
      </button>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          ref={dialogContentRef}
          className="w-full max-w-[95vw] sm:max-w-2xl bg-zinc-800 border-zinc-700 text-zinc-100"
          onOpenAutoFocus={(e) => e.preventDefault()}
          
          // Restore focus to the button that opened the dialog, shadcn accessibility
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            openProjectButtonRef.current?.focus();
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl font-bold text-zinc-100 pr-8">
                {title}
              </DialogTitle>
            
              {/* shadcn accessibility */}
              <DialogDescription className="sr-only">
                Project details including tags, description, and code preview for {title}
              </DialogDescription>

              <button 
                onClick={toggleFavorite}
                disabled={isTogglingFavorite}
                className="text-yellow-400 hover:scale-110 transition-transform disabled:opacity-50"
                aria-label={favorited ? "Unfavorite" : "Favorite"}
              >
                <Star size={32} fill={favorited ? "currentColor" : "none"} strokeWidth={2} />
              </button>
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            
            {/* All Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-python-yellow text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Full Description */}
            <p className="text-zinc-300 text-base leading-relaxed mb-6">
              {description}
            </p>

            {/* Code Viewer */}
            <div className="mb-6 w-full min-w-0 bg-zinc-900 rounded-lg overflow-hidden">
              <Editor
                height={editorHeight}
                defaultLanguage="python"
                value={code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "none",
                  folding: false,
                  glyphMargin: false,
                  automaticLayout: true,
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                }}
                onMount={handleEditorDidMount}
                className="min-h-[120px]"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleOpenProject}
                className="flex-1 bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Open Project
              </button>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectCard;