import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PostFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    description: string;
    code: string;
    tags: string[];
    isVisible?: boolean;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    code: string;
    tags: string[];
    isVisible: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string;
  onDelete?: () => Promise<void>;
  deleteLoading?: boolean;
  deleteError?: string;
}

export const PostForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading,
  error,
  onDelete,
  deleteLoading = false,
  deleteError = '',
}: PostFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add this useEffect to update form state when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCode(initialData.code || '');
      setTags(initialData.tags || []);
      setIsVisible(initialData.isVisible ?? true); // Default to true
    }
  }, [initialData]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmedTag = tagInput.trim().toLowerCase();
      if (!tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, description, code, tags, isVisible });
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-zinc-200 mb-4">
        {mode === 'create' ? 'Create New Post' : 'Edit Post'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Awesome Project"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="A brief description of your project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a tag and press Enter"
          />
          <p className="text-xs text-zinc-400 mt-1">Press Enter to add a tag</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-python-yellow text-white px-3 py-1 rounded-lg text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-700 rounded-lg my-2">
          <input
            type="checkbox"
            id="isVisible"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-zinc-600 border-zinc-500 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="isVisible" className="text-sm font-medium text-zinc-300 cursor-pointer">
            Make this post publicly available
          </label>
        </div>

        {(error || deleteError) && (
          <div className={`p-3 ${error ? 'bg-red-900/30 border-red-700' : 'bg-red-900/20 border-red-800'} border rounded-lg`}>
            <p className={`text-sm ${error ? 'text-red-300' : 'text-red-400'}`}>
              {error || deleteError}
            </p>
          </div>
        )}

        {/* Buttons section - using same flex pattern as ProjectCard */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Update/Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ flexGrow: 4 }}
          >
            {loading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Post' : 'Update Post')}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ flexGrow: 4 }}
          >
            Cancel
          </button>

          {/* Delete Button */}
          {mode === 'edit' && onDelete && (
            showDeleteConfirm ? (
              <div className="flex-1 flex flex-col gap-2" style={{ flexGrow: 2 }}>
                <div className="text-xs text-red-300 mb-1 text-center">Confirm delete?</div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading || deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ flexGrow: 2 }}
              >
                Delete
              </button>
            )
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {mode === 'edit' && onDelete && showDeleteConfirm && (
          <div className="mt-3 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-300 mb-3 text-center">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Post'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-100 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};