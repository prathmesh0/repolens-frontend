import { enhancedFetch } from '@/api/interceptor';
import { ApiResponse } from '@/types/api';

export async function getMethod<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await enhancedFetch(url, { ...options, method: 'GET' });
  const json = (await response.json()) as ApiResponse<T>;
  return json;
}

export async function postMethod<T, D = unknown>(
  url: string,
  data?: D,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const isFormData = data instanceof FormData;
  const response = await enhancedFetch(url, {
    ...options,
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options?.headers || {}),
    },
  });

  return (await response.json()) as ApiResponse<T>;
}

export async function putMethod<T, D = unknown>(
  url: string,
  data?: D,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const isFormData = data instanceof FormData;
  const response = await enhancedFetch(url, {
    ...options,
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options?.headers || {}),
    },
  });

  return (await response.json()) as ApiResponse<T>;
}

export async function deleteMethod<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await enhancedFetch(url, { ...options, method: 'DELETE' });
  const json = (await response.json()) as ApiResponse<T>;
  return json;
}
