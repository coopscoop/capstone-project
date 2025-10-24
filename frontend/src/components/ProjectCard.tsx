import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ProjectCard = ({ 
  title = "Project Title",
  tags = ["tags"],
  description = "A description of the project",
  favorited: initialFavorited = false,
  onOpen = () => {}
}) => {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFavorited(!favorited);
  };

  const handleOpenClick = () => {
    setIsModalOpen(true);
  };

  const handleOpenProject = () => {
    setIsModalOpen(false);
    onOpen();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-zinc-200 hover:shadow-lg transition-shadow">
      {/* Header with title and star */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-zinc-900 flex-1 truncate pr-2">{title}</h3>
        <button 
          onClick={toggleFavorite}
          className="shrink-0 text-zinc-900 hover:scale-110 transition-transform"
          aria-label={favorited ? "Unfavorite" : "Favorite"}
        >
          <Star 
            size={28}
            fill={favorited ? "currentColor" : "none"}
            strokeWidth={2}
          />
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
        {tags.length > 2 && (
          <span className="text-zinc-400 self-center">...</span>
        )}
      </div>

      {/* Description */}
      <p className="text-zinc-500 mb-6 text-base leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Open Button */}
      <button 
        onClick={handleOpenClick}
        className="w-full bg-python-blue hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Open
      </button>

      {/* Modal - scaffolded from shadcn docs */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* [&>button]:hidden hides the close button, top right is a bit cramped with the favourite there as well */}
        <DialogContent className="max-w-2xl bg-white [&>button]:hidden"> 
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl font-bold text-zinc-900 pr-8">
                {title}
              </DialogTitle>
              <button 
                onClick={toggleFavorite}
                className="text-zinc-900 hover:scale-110 transition-transform"
                aria-label={favorited ? "Unfavorite" : "Favorite"}
              >
                <Star 
                  size={32}
                  fill={favorited ? "currentColor" : "none"}
                  strokeWidth={2}
                />
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
            <p className="text-zinc-600 text-base leading-relaxed mb-6">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={handleOpenProject}
                className="flex-1 bg-[#00A2E8] hover:bg-[#0092d4] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Open Project
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-semibold py-3 px-6 rounded-lg transition-colors"
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