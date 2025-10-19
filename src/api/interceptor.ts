import { FetchInterceptor } from '@/types/api';
import { removeFromLocalStorage } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function createInterceptor(): Promise<FetchInterceptor> {
  const interceptors: FetchInterceptor = {
    request: {
      use: (handler) => {
        interceptors.request.handler = handler;
      },
      handler: (request) => {
        const headers = new Headers(request.init?.headers);
        const token = localStorage.getItem('token')
          ? JSON.parse(localStorage.getItem('token') || '{}')
          : null;

        if (token?.value) {
          headers.append('Authorization', `Bearer ${token.value}`);
        }

        return { ...request, init: { ...request.init, headers } };
      },
    },

    response: {
      use: (handler) => {
        interceptors.response.handler = handler;
      },
      handler: (response) => {
        // Handle expired or invalid tokens
        if (response.status === 401) {
          removeFromLocalStorage('token');
          removeFromLocalStorage('auth');

          if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/'
          ) {
            window.location.href = '/';
          }
        }

        return response;
      },
    },
  };

  return interceptors;
}

export async function enhancedFetch(input: RequestInfo, init?: RequestInit) {
  const interceptor = await createInterceptor();
  const modifiedRequest = interceptor.request.handler({ input, init });

  const response = await fetch(`${BASE_URL}${modifiedRequest.input}`, {
    ...modifiedRequest.init,
    cache: 'no-cache',
  });

  const handledResponse = await interceptor.response.handler(response);
  return handledResponse;
}
