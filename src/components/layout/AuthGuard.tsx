'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// Pages an unapproved worker is still allowed to reach (so they can get help
// or manage their own account while waiting on approval).
const ALLOWED_WHILE_UNAPPROVED = ['/support', '/profile'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    const status = user?.status;
    const isAllowedPath = ALLOWED_WHILE_UNAPPROVED.some((p) => pathname.startsWith(p));
    if (status && status !== 'APPROVED' && !isAllowedPath) {
      router.replace('/auth/pending-review');
    }
  }, [_hasHydrated, isAuthenticated, user?.status, pathname, router]);

  // Show nothing until Zustand has rehydrated
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (user?.status && user.status !== 'APPROVED' && !ALLOWED_WHILE_UNAPPROVED.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return <>{children}</>;
}