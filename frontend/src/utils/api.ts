// API helper for authenticated requests
export async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5225/api';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers if provided
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  // Add authorization token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Worst case we log the user out if they're attempting to access an unauthorized endpoint
  // Less strict than simply logging them out on any 401 response but it's better than nothing
  if (response.status === 401 && url !== '/user') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
}