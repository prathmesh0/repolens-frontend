import { clearAuthStorage, getFromLocalStorage } from '@/lib/utils';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function enhancedFetch(input: RequestInfo, init?: RequestInit) {
  // Add Authorization header if token exists
  const token = getFromLocalStorage('token');
  const headers = new Headers(init?.headers || {});

  if (token) headers.append('Authorization', `Bearer ${token}`);
  const finalUrl =
    typeof input === 'string' && !input.startsWith('http')
      ? `${BASE_URL}${input}`
      : input;

  const response = await fetch(finalUrl, {
    ...init,
    headers,
    cache: 'no-cache',
  });

  // Handle unauthorized token
  if (response.status === 401) {
    clearAuthStorage();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  return response;
}
