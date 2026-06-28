'use client';

// ============================================================
//  AdminSidebar — app-shell left nav for the admin area.
//  Collapses to icon-only on narrow viewports.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Rss,
  Wrench,
  Briefcase,
  GraduationCap,
  Trophy,
  Image,
  Mail,
  Settings,
  SlidersHorizontal,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { adminAuth, type MeResponse } from '@/lib/admin-api';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/pages', icon: FileText, label: 'Pages & Sections' },
  { href: '/admin/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/admin/blog', icon: Rss, label: 'Blog' },
  { href: '/admin/skills', icon: Wrench, label: 'Skills' },
  { href: '/admin/experience', icon: Briefcase, label: 'Experience' },
  { href: '/admin/education', icon: GraduationCap, label: 'Education' },
  { href: '/admin/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/admin/media', icon: Image, label: 'Media' },
  { href: '/admin/messages', icon: Mail, label: 'Messages' },
  { href: '/admin/config', icon: SlidersHorizontal, label: 'Configuration' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface Props {
  user: MeResponse;
}

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await adminAuth.logout();
    } catch {
      // ignore — redirect regardless
    }
    router.replace('/admin/login');
  }

  function isActive(item: (typeof NAV_ITEMS)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 border-r transition-all duration-200',
        collapsed ? 'w-[64px]' : 'w-[220px]',
      )}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Logo / brand */}
      <div
        className="flex items-center gap-3 px-4 py-[18px] border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-[8px] grid place-items-center shrink-0 border text-[13px] font-bold"
          style={{
            backgroundColor: 'var(--accent-dim)',
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-space-grotesk)',
          }}
          aria-hidden="true"
        >
          R
        </div>
        {!collapsed && (
          <span
            className="text-[14px] font-semibold truncate"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
          >
            Admin
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Admin navigation">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] font-medium',
                    'transition-colors duration-150 outline-none',
                    active
                      ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="shrink-0">
                    <item.icon size={16} aria-hidden="true" />
                  </span>
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: user, theme, logout */}
      <div
        className="border-t py-3 px-2 flex flex-col gap-1"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* User */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div
              className="w-7 h-7 rounded-full grid place-items-center border text-[11px] font-semibold shrink-0"
              style={{
                backgroundColor: 'var(--accent-dim)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
              aria-hidden="true"
            >
              <User size={13} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: 'var(--text)' }}
              >
                {user.name}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: 'var(--muted)' }}
              >
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Theme toggle + collapse */}
        <div className={cn('flex gap-1 px-1', collapsed ? 'flex-col items-center' : 'items-center')}>
          <ThemeToggle className="!w-8 !h-8" />
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="w-8 h-8 rounded-[8px] border grid place-items-center transition-colors duration-150"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--muted)',
              backgroundColor: 'var(--surface)',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={14} aria-hidden="true" />
            ) : (
              <ChevronLeft size={14} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] font-medium w-full',
            'transition-colors duration-150',
            'hover:bg-red-500/10 hover:text-red-400',
            loggingOut && 'opacity-60 cursor-not-allowed',
          )}
          style={{ color: 'var(--muted)' }}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={16} aria-hidden="true" className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
