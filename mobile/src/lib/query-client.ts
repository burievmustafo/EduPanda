import { QueryClient } from '@tanstack/react-query';

/**
 * Yagona QueryClient — provider ham, session store ham (role almashganda
 * kesh tozalash uchun) shuni ishlatadi.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
