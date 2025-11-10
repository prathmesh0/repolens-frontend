import {
  clearAuthStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from '@/lib/utils';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

async function refreshAccessToken() {
  try {
    const refreshToken = getFromLocalStorage('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Refresh token expired');

    const data = await response.json();

    const { accessToken, refreshToken: newRefreshToken } = data;
    saveToLocalStorage('token', accessToken);
    saveToLocalStorage('refreshToken', newRefreshToken);

    return accessToken;
  } catch (error) {
    clearAuthStorage();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  }
}

export async function enhancedFetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  // Add Authorization header if token exists
  let token = getFromLocalStorage('token');
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
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        token = await refreshAccessToken();
        isRefreshing = false;
        // Retry all pending requests
        pendingRequests.forEach((callback) => callback());
        pendingRequests = [];
      } catch (e) {
        isRefreshing = false;
        // refresh token failed, already redirected to login
        throw e;
      }
    }
    // Queue this request until token refresh completed
    return new Promise<Response>((resolve, reject) => {
      pendingRequests.push(() => {
        headers.set('Authorization', `Bearer ${token}`);
        fetch(finalUrl, { ...init, headers, cache: 'no-cache' })
          .then(resolve)
          .catch(reject);
      });
    });
  }
  return response;
}
