import { enhancedFetch } from '@/api/interceptor';

export async function apiGet(endpoint: string) {
  const res = await enhancedFetch(endpoint, { method: 'GET' });
  return res.json();
}

export async function apiPost(endpoint: string, body?: unknown) {
  const options: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await enhancedFetch(endpoint, options);
  return res.json();
}

export async function apiPut(endpoint: string, body: unknown) {
  const res = await enhancedFetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete(endpoint: string) {
  const res = await enhancedFetch(endpoint, { method: 'DELETE' });
  return res.json();
}
