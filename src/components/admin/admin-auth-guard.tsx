'use client';

// ============================================================
//  AdminAuthGuard — wraps admin pages.
//  On mount, calls GET /api/auth/me with credentials:'include'.
//  If 401 → redirect to /admin/login.
//  Shows a loading screen until auth resolves.
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { adminAuth, type MeResponse } from '@/lib/admin-api';

interface Props {
  children: (user: MeResponse) => React.ReactNode;
}

export function AdminAuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip guard on the login page itself
    if (pathname === '/admin/login') {
      setChecking(false);
      return;
    }

    adminAuth
      .me()
      .then((u) => {
        setUser(u);
        setChecking(false);
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [pathname, router]);

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: 'var(--accent)' }}
          aria-label="Checking authentication…"
        />
      </div>
    );
  }

  if (!user) return null; // Will be redirected

  return <>{children(user)}</>;
}
