import { apiRequest } from '@/utils/api';
import type { Favourite } from '@/types';

export const favouriteService = {
  async getUserFavourites(userId: number): Promise<Favourite[]> {
    const response = await apiRequest(`/favourite/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to load favorites');
    }
    return response.json();
  },

  async add(postId: number, userId: number): Promise<void> {
    const response = await apiRequest(`/favourite/${postId}/${userId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to add favorite');
    }
  },

  async remove(postId: number, userId: number): Promise<void> {
    const response = await apiRequest(`/favourite/${postId}/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove favorite');
    }
  },
};