// Same-origin proxy (see rewrites in next.config.ts). Auth lives in httpOnly
// cookies on this origin; JS never sees or sends the tokens.
const BASE_URL = '/api';

// 401s from these endpoints are real answers (bad credentials, dead refresh
// token), not an expired access token, so they must not trigger a refresh.
const NO_REFRESH_PATHS = [
  '/users/login',
  '/users/register',
  '/users/refresh-token',
  '/users/logout',
];

// One refresh in flight at a time; every 401 awaits the same promise.
let refreshPromise: Promise<void> | null = null;

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function refreshSession(): Promise<void> {
  // The refresh cookie is sent automatically; the new cookies come back in
  // Set-Cookie headers.
  const response = await fetch(`${BASE_URL}/users/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Session expired');
}

function refreshOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
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
    typeof input === 'string' && !input.startsWith(BASE_URL)
      ? `${BASE_URL}${input}`
      : input;

  const send = () =>
    fetch(finalUrl, { ...init, credentials: 'include', cache: 'no-cache' });

  const response = await send();

  const url = typeof finalUrl === 'string' ? finalUrl : finalUrl.url;
  if (response.status !== 401 || NO_REFRESH_PATHS.some((p) => url.includes(p))) {
    return response;
  }

  try {
    await refreshOnce();
  } catch (e) {
    redirectToLogin();
    throw e;
  }

  // Retry once; a second 401 means the session is gone.
  const retry = await send();
  if (retry.status === 401) redirectToLogin();
  return retry;
}
