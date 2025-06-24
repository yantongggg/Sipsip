import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard() {
  const { user } = useAuth();
  const router = useRouter();

  const requireAuth = (action: () => void) => {
    if (!user) {
      router.push('/auth');
      return false;
    }
    action();
    return true;
  };

  return { requireAuth, isAuthenticated: !!user };
}