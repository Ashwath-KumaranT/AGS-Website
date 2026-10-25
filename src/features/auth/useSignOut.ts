import { useNavigate } from 'react-router-dom';
import { toast } from '@/store/uiStore';
import { signOutExplicitly } from './authStore';

/**
 * Signs out from anywhere in the shell. The auth store drops the previous shopper's cached
 * queries and wishlist, so every sign-out path behaves the same.
 */
export function useSignOut() {
  const navigate = useNavigate();
  return async () => {
    await signOutExplicitly();
    toast.info('You’ve been signed out');
    navigate('/', { replace: true });
  };
}
