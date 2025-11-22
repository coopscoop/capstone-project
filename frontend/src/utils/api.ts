export async function apiRequest(url: string, options: RequestInit = {}) {

  const token = localStorage.getItem('accessToken'); // Changed from 'token'
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5225/api';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Let AuthContext handle token refresh
  if (response.status === 401 && url !== '/user') {
    // Trigger a page reload to let AuthContext refresh the token
    window.location.reload();
    throw new Error('Unauthorized');
  }

  return response;
}