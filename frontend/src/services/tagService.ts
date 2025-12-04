import { apiRequest } from '@/utils/api';

export const tagService = {
  async addTag(postId: number, tagName: string): Promise<void> {
    const response = await apiRequest(`/tag/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ tagName }),
    });
    if (!response.ok) {
      throw new Error('Failed to add tag');
    }
  },

  async deletePostTags(postId: number): Promise<void> {
    const response = await apiRequest(`/tag/post/${postId}`, {
      method: 'DELETE',
    });

    // 400 errors are expected when no tags exist for this post
    if (!response.ok && response.status >= 500) {
      throw new Error('Failed to delete tags');
    }
  },

  async addMultipleTags(postId: number, tags: string[]): Promise<void> {
    await Promise.all(
      tags.map(tag => this.addTag(postId, tag))
    );
  },
};