import { apiRequest } from '@/utils/api';
import type { User, UpdateUserRequest, CreateUserRequest } from '@/types';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiRequest('/user', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  async getById(id: number): Promise<User> {
    const response = await apiRequest(`/user/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user with ID ${id}`);
    }

    return response.json();
  },

  async getByEmail(email: string): Promise<User> {
    const response = await apiRequest(`/user/email/${email}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user with email ${email}`);
    }

    return response.json();
  },

  async create(data: CreateUserRequest): Promise<User> {
    const response = await apiRequest('/user', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create user');
    }

    return response.json();
  },

  async update(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiRequest(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update user');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await apiRequest(`/user/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  },
};