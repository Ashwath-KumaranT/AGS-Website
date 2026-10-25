import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { initAuth } from '@/features/auth/authStore';
import { queryClient } from './queryClient';
import { router } from './router';

export function App() {
  useEffect(() => initAuth(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
