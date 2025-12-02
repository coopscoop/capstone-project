import React, { useState, useRef, useEffect } from "react";
import { Star, User, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Editor } from "@monaco-editor/react";
import { useAuth } from "@/contexts/AuthContext";
import { PostForm } from "@/components";

interface ProjectCardProps {
  postId: number;
  title?: string;
  tags?: string[];
  description?: string;
  favorited?: boolean;
  code?: string;
  userId?: number;
  numberOfLikes?: number;
  displayName?: string;
  isVisible?: boolean;
  onFavoriteToggle?: (postId: number, isFavorited: boolean) => Promise<void>;
  onOpen?: () => void;
  onUpdate?: (postId: number, data: any) => Promise<void>;
}

const ProjectCard = ({
  postId,
  title = "Project Title",
  tags = ["tags"],
  description = "A description of the project",
  favorited: initialFavorited = false,
  code,
  userId,
  numberOfLikes = 0, // Default to 0
  displayName,
  isVisible,
  onFavoriteToggle,
  onOpen = () => {},
  onUpdate,
}: ProjectCardProps) => {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [editorHeight, setEditorHeight] = useState("200px");
  const [formattedCode, setFormattedCode] = useState(code);
  const editorRef = useRef<any>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const openProjectButtonRef = useRef<HTMLButtonElement>(null);

  // Check if current user can edit this post (owner or admin)
  const canEdit = user && (user.isAdmin || user.userId === userId);

  // debug print on modal open
  useEffect(() => {
    console.log("title:", title, " isVisible:", isVisible);
  }, [isEditing]);

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
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleOpenClick = () => {
    setTimeout(() => {
      setIsModalOpen(true);
      setIsEditing(false); // Reset to details view when opening
    }, 10);
  };

  const handleOpenProject = () => {
    setIsModalOpen(false);
    onOpen();
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdatePost = async (data: {
    title: string;
    description: string;
    code: string;
    isVisible: boolean;
    tags: string[];
  }) => {
    if (onUpdate) {
      await onUpdate(postId, data);
    }
    setIsEditing(false);
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setTimeout(() => {
      editor.layout();
    }, 0);
  };

  // Update editor height based on screen size
  useEffect(() => {
    const updateEditorHeight = () => {
      if (window.innerWidth < 640) {
        setEditorHeight("150px");
      } else {
        setEditorHeight("200px");
      }
    };

    if (code) {
      const formattedCode = code.replace(/\\n/g, "\n");
      setFormattedCode(formattedCode);
    }

    updateEditorHeight();
    window.addEventListener("resize", updateEditorHeight);

    return () => window.removeEventListener("resize", updateEditorHeight);
  }, []);

  // Handle resize when modal opens
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

      if (dialogContentRef.current) {
        const resizeObserver = new ResizeObserver(updateLayout);
        resizeObserver.observe(dialogContentRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }
  }, [isModalOpen]);

  // Project Details View
  const renderDetailsView = () => (
    <>
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
          value={formattedCode}
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
            stickyScroll: { enabled: false },
          }}
          onMount={handleEditorDidMount}
          className="min-h-[120px]"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleOpenProject}
          className="flex-1 bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          style={{ flexGrow: canEdit ? "4" : "1" }}
        >
          Open Project
        </button>

        {canEdit && (
          <button
            onClick={handleStartEdit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            style={{ flexGrow: "4" }}
          >
            <Edit size={16} className="inline mr-2" />
            Edit Properties
          </button>
        )}

        <button
          onClick={() => setIsModalOpen(false)}
          className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-colors"
          style={{ flexGrow: canEdit ? "2" : "1" }}
        >
          Close
        </button>
      </div>
    </>
  );

  // Edit Form View
  const renderEditView = () => (
    <div className="mt-2">
      <PostForm
        mode="edit"
        initialData={{
          title: title,
          description: description || "",
          code: code || "",
          tags: tags || [],
          isVisible: isVisible ?? false,
        }}
        onSubmit={handleUpdatePost}
        onCancel={handleCancelEdit}
        loading={false}
        error=""
      />
    </div>
  );

  return (
    <div className="bg-zinc-700 rounded-lg shadow-md p-6 border border-zinc-600 hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-zinc-100 wrap-break-word">
              {title}
            </h3>
            {/* Owner's Display Name */}
            <div className="flex items-center gap-1.5 mt-1 text-sm text-zinc-400">
              <User size={14} />
              <span>by {displayName}</span>
            </div>
          </div>

          {/* Favorite and Likes Section */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Likes Count */}
            <div className="flex items-center gap-1 text-zinc-300 bg-zinc-600 px-2 py-1 rounded-lg">
              <span className="text-sm font-medium">{numberOfLikes}</span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              disabled={isTogglingFavorite}
              className="text-yellow-400 hover:scale-110 transition-transform disabled:opacity-50"
              aria-label={favorited ? "Unfavorite" : "Favorite"}
            >
              <Star
                size={28}
                fill={favorited ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </button>
          </div>
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
          {tags.length > 2 && (
            <span className="text-zinc-400 self-center">...</span>
          )}
        </div>

        {/* Description - This will grow to push the button to the bottom */}
        <p className="text-zinc-300 mb-6 text-base leading-relaxed line-clamp-2 grow">
          {description}
        </p>

        {/* Open Button - This will always be at the bottom */}
        <button
          ref={openProjectButtonRef}
          onClick={handleOpenClick}
          className="w-full bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-auto"
        >
          Open
        </button>
      </div>
      {/* Modal - Updated to show owner name and likes in modal too */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          ref={dialogContentRef}
          className="w-full max-w-[95vw] sm:max-w-2xl bg-zinc-800 border-zinc-700 text-zinc-100 [&>button]:hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            openProjectButtonRef.current?.focus();
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-zinc-100 text-left">
                  {isEditing ? "Edit Project" : title}
                </DialogTitle>
                {!isEditing && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                    <User size={16} />
                    <span>{displayName}</span>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center gap-3 ml-4">
                  {/* Likes in modal */}
                  <div className="flex items-center gap-1 text-zinc-300">
                    <span className="text-sm font-medium">{numberOfLikes}</span>
                  </div>

                  <button
                    onClick={toggleFavorite}
                    disabled={isTogglingFavorite}
                    className="text-yellow-400 hover:scale-110 transition-transform disabled:opacity-50"
                    aria-label={favorited ? "Unfavorite" : "Favorite"}
                  >
                    <Star
                      size={32}
                      fill={favorited ? "currentColor" : "none"}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="mt-4">
            {isEditing ? renderEditView() : renderDetailsView()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectCard;
