import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, updateUser, logout } = useAuthStore();
  const router = useRouter();

  const signOut = () => {
    logout();
    router.push('/auth/login');
  };

  return { user, token, isAuthenticated, setAuth, updateUser, signOut };
}
