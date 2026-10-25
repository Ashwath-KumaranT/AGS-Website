import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/services';

/**
 * Lives apart from App so non-component code (the auth store, which drops one shopper's
 * cached data before the next one signs in) can reach it.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // don't retry errors that won't fix themselves
      retry: (count, error) =>
        !(isApiError(error) && ['AUTH_REQUIRED', 'NOT_FOUND', 'VALIDATION'].includes(error.code)) &&
        count < 2,
    },
  },
});
