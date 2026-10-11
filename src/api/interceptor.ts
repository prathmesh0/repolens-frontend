import {
  clearAuthStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from '@/lib/utils';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// 401s from these endpoints are real answers (bad credentials, dead refresh
// token), not an expired access token, so they must not trigger a refresh.
const NO_REFRESH_PATHS = [
  '/users/login',
  '/users/register',
  '/users/refresh-token',
  '/users/logout',
];

// One refresh in flight at a time; every 401 awaits the same promise.
let refreshPromise: Promise<string> | null = null;

function redirectToLogin() {
  clearAuthStorage();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getFromLocalStorage('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${BASE_URL}/users/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Refresh token expired');

  // Backend envelope: { success, message, data: { accessToken, refreshToken } }
  const body = await response.json();
  const accessToken = body?.data?.accessToken;
  const newRefreshToken = body?.data?.refreshToken;
  if (!accessToken || !newRefreshToken) {
    throw new Error('Invalid refresh response');
  }

  saveToLocalStorage('token', accessToken);
  saveToLocalStorage('refreshToken', newRefreshToken);
  return accessToken;
}

function getRefreshedToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function enhancedFetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const finalUrl =
    typeof input === 'string' && !input.startsWith('http')
      ? `${BASE_URL}${input}`
      : input;

  const send = (token: string | null) => {
    const headers = new Headers(init?.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(finalUrl, {
      ...init,
      headers,
      credentials: 'include',
      cache: 'no-cache',
    });
  };

  const response = await send(getFromLocalStorage('token'));

  const url = typeof finalUrl === 'string' ? finalUrl : finalUrl.url;
  if (response.status !== 401 || NO_REFRESH_PATHS.some((p) => url.includes(p))) {
    return response;
  }

  let newToken: string;
  try {
    newToken = await getRefreshedToken();
  } catch (e) {
    redirectToLogin();
    throw e;
  }

  // Retry once with the fresh token; a second 401 means the session is gone.
  const retry = await send(newToken);
  if (retry.status === 401) redirectToLogin();
  return retry;
}
