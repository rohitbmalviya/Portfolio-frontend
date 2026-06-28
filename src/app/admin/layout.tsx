'use client';

// ============================================================
//  Admin Root Layout
//  - Uses AdminAuthGuard to protect all /admin/* routes
//    (except /admin/login which has its own sub-layout).
//  - Renders the sidebar + main content shell.
//  - Keeps the same design tokens; NO public nav/footer.
// ============================================================

import { usePathname } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

const PUBLIC_PATHS = ['/admin/login'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (isPublicPath) {
    // Login page — no sidebar, no guard needed
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      {(user) => (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
          <AdminSidebar user={user} />
          <main className="flex-1 min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      )}
    </AdminAuthGuard>
  );
}
