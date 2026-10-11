import { useQuery } from '@tanstack/react-query';
import { User } from '@/api/services';

export const ME_QUERY_KEY = ['me'] as const;

// Single source of truth for "am I logged in". Errors (401 after a failed
// refresh, network, 5xx) surface as `error`; callers decide what to do.
export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: User.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
