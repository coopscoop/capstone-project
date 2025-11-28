import { apiRequest } from '@/utils/api';
import type { User } from '@/types';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiRequest('/user', {
      method: 'GET',
    });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Admin privileges required');
      }
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
};