import { apiRequest } from '@/utils/api';
import type { Post, CreatePostRequest, UpdatePostRequest } from '@/types';

export const postService = {
  async getAll(): Promise<Post[]> {
    const response = await apiRequest('/Posts');
    if (!response.ok) {
      throw new Error('Failed to load posts');
    }
    return response.json();
  },

  async create(post: CreatePostRequest): Promise<Post> {
    const response = await apiRequest('/Posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create post: ${errorText}`);
    }
    return response.json();
  },

  async update(id: number, data: UpdatePostRequest): Promise<Post> {
    const response = await apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update post');
    }

    return response.json();
  },

  async delete(postId: number): Promise<void> {
    const response = await apiRequest(`/Posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
  },

  async getUserPosts(userId: number): Promise<Post[]> {
    const response = await apiRequest(`/Posts/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }
    return response.json();
  },
};