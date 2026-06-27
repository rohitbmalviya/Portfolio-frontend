'use client';

// ============================================================
//  Admin Dashboard — overview with counts + quick links
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  FolderKanban,
  Rss,
  Wrench,
  Briefcase,
  GraduationCap,
  Trophy,
  Image,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { adminStats, type DashboardCounts } from '@/lib/admin-api';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider } from '@/components/admin/toast';
import { AdminCard } from '@/components/admin/ui';

interface StatCard {
  key: keyof DashboardCounts;
  label: string;
  count: number | null;
  href: string;
  icon: React.ElementType;
  accent?: boolean;
}

const STAT_CARDS: StatCard[] = [
  { key: 'pages', label: 'Pages', count: null, href: '/admin/pages', icon: FileText },
  { key: 'projects', label: 'Projects', count: null, href: '/admin/projects', icon: FolderKanban },
  { key: 'blogPosts', label: 'Blog Posts', count: null, href: '/admin/blog', icon: Rss },
  { key: 'skills', label: 'Skills', count: null, href: '/admin/skills', icon: Wrench },
  { key: 'experience', label: 'Experience', count: null, href: '/admin/experience', icon: Briefcase },
  { key: 'education', label: 'Education', count: null, href: '/admin/education', icon: GraduationCap },
  { key: 'achievements', label: 'Achievements', count: null, href: '/admin/achievements', icon: Trophy },
  { key: 'media', label: 'Media', count: null, href: '/admin/media', icon: Image },
];

function DashboardContent() {
  const [stats, setStats] = useState<StatCard[]>(STAT_CARDS);

  useEffect(() => {
    // Single API call returns ALL content counts (replaces 7 list calls).
    adminStats
      .get()
      .then((counts) => {
        setStats(STAT_CARDS.map((s) => ({ ...s, count: counts[s.key] ?? 0 })));
      })
      .catch(() => {
        setStats(STAT_CARDS.map((s) => ({ ...s, count: 0 })));
      });
  }, []);

  const quickLinks = [
    { label: 'View public site', href: '/', icon: Globe, external: true },
    { label: 'Manage pages', href: '/admin/pages', icon: FileText },
    { label: 'Add project', href: '/admin/projects/new', icon: FolderKanban },
    { label: 'Write blog post', href: '/admin/blog/new', icon: Rss },
    { label: 'Edit settings', href: '/admin/settings', icon: Wrench },
  ];

  return (
    <AdminShell
      title="Dashboard"
      description="Welcome back. Here's an overview of your portfolio content."
    >
      {/* Stats grid */}
      <section aria-label="Content statistics">
        <h2
          className="text-[13px] font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Content counts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <Link key={s.href} href={s.href}>
              <AdminCard className="hover:border-[var(--accent)] transition-colors duration-150 cursor-pointer group h-full">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[10px] grid place-items-center border shrink-0"
                    style={{
                      backgroundColor: 'var(--accent-dim)',
                      borderColor: 'var(--accent)',
                    }}
                    aria-hidden="true"
                  >
                    <s.icon size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p
                      className="text-[22px] font-bold leading-none"
                      style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {s.count === null ? '—' : s.count}
                    </p>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: 'var(--muted)' }}
                    >
                      {s.label}
                    </p>
                  </div>
                </div>
              </AdminCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section aria-label="Quick actions">
        <h2
          className="text-[13px] font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Quick links
        </h2>
        <div className="flex flex-col gap-2 max-w-[480px]">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 px-4 py-3 rounded-[10px] border transition-all duration-150 group"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              <link.icon size={15} style={{ color: 'var(--accent)' }} aria-hidden="true" className="shrink-0" />
              <span className="text-[13px] font-medium flex-1" style={{ color: 'var(--text)' }}>
                {link.label}
              </span>
              <ArrowRight
                size={14}
                style={{ color: 'var(--muted)' }}
                aria-hidden="true"
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
