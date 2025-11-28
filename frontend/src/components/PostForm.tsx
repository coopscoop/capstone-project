import { useState } from 'react';
import { X } from 'lucide-react';

interface PostFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    description: string;
    code: string;
    tags: string[];
  };
  onSubmit: (data: {
    title: string;
    description: string;
    code: string;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string;
}

export const PostForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading,
  error,
}: PostFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

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
    await onSubmit({ title, description, code, tags });
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

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            placeholder="print('Hello, World!')"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Post' : 'Update Post')}
          </button>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-zinc-600 text-white rounded-lg hover:bg-zinc-500 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};