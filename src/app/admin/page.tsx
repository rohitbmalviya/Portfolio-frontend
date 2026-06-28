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
  MailOpen,
  MessagesSquare,
  CalendarDays,
} from 'lucide-react';
import { adminStats, adminContact, type DashboardCounts } from '@/lib/admin-api';
import type { ContactThread } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider } from '@/components/admin/toast';
import { AdminCard } from '@/components/admin/ui';

// ── Helpers ───────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: days > 365 ? 'numeric' : undefined,
  });
}

// ── Content stat cards ────────────────────────────────────────

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

// ── MessagesPanel ─────────────────────────────────────────────

interface MessagesPanelState {
  loading: boolean;
  threads: ContactThread[];
  unread: number;
}

function MessagesPanel() {
  const [state, setState] = useState<MessagesPanelState>({
    loading: true,
    threads: [],
    unread: 0,
  });

  useEffect(() => {
    Promise.all([adminContact.listThreads(), adminContact.unreadCount()])
      .then(([threads, { count }]) => {
        // Sort newest-last-message first (mirrors the messages page)
        const sorted = [...threads].sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
        );
        setState({ loading: false, threads: sorted, unread: count });
      })
      .catch(() => {
        setState({ loading: false, threads: [], unread: 0 });
      });
  }, []);

  const { loading, threads, unread } = state;

  // Most-recent 5 threads for the preview list
  const recent = threads.slice(0, 5);

  // Threads with activity in the past 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeekCount = threads.filter(
    (t) => new Date(t.lastMessageAt).getTime() >= weekAgo,
  ).length;

  const statTiles: { label: string; count: number | null; icon: React.ElementType }[] = [
    { label: 'Unread', count: loading ? null : unread, icon: MailOpen },
    { label: 'Total', count: loading ? null : threads.length, icon: MessagesSquare },
    { label: 'This week', count: loading ? null : thisWeekCount, icon: CalendarDays },
  ];

  return (
    <section aria-label="Messages overview" className="mb-8">
      {/* Section header — matches existing section heading style */}
      <div className="flex items-center gap-3 mb-4">
        <h2
          className="text-[13px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Messages
        </h2>
        {/* Unread badge — only shown when there are unread threads */}
        {!loading && unread > 0 && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
            style={{ backgroundColor: '#ef4444', color: '#fff' }}
            aria-label={`${unread} unread message${unread !== 1 ? 's' : ''}`}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>

      {/* Stat tiles — same visual pattern as content-count cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {statTiles.map((tile) => (
          <Link
            key={tile.label}
            href="/admin/messages"
            onMouseEnter={(e) => {
              const card = e.currentTarget.firstElementChild as HTMLElement | null;
              if (card) card.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              const card = e.currentTarget.firstElementChild as HTMLElement | null;
              if (card) card.style.borderColor = 'var(--border)';
            }}
          >
            <AdminCard className="transition-colors duration-150 cursor-pointer h-full">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-[10px] grid place-items-center border shrink-0"
                  style={{
                    backgroundColor: 'var(--accent-dim)',
                    borderColor: 'var(--accent)',
                  }}
                  aria-hidden="true"
                >
                  <tile.icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p
                    className="text-[22px] font-bold leading-none"
                    style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {tile.count === null ? '—' : tile.count}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {tile.label}
                  </p>
                </div>
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>

      {/* Recent threads list */}
      <AdminCard className="p-0 overflow-hidden">
        {loading ? (
          /* Loading skeleton */
          <div className="p-5 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-[8px] animate-pulse"
                style={{ backgroundColor: 'var(--surface-2)' }}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          /* Empty state */
          <p
            className="text-[13px] text-center py-8"
            style={{ color: 'var(--muted)' }}
          >
            No messages yet
          </p>
        ) : (
          <>
            <ul aria-label="Recent message threads">
              {recent.map((thread, idx) => (
                <li
                  key={thread.id}
                  style={
                    idx < recent.length - 1
                      ? { borderBottom: '1px solid var(--border)' }
                      : undefined
                  }
                >
                  <Link
                    href="/admin/messages"
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors duration-150 group"
                    aria-label={`Message from ${thread.name}${thread.unread ? ' — unread' : ''}`}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        'var(--surface-2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Unread dot */}
                    <span
                      className="mt-2 w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: thread.unread ? 'var(--accent)' : 'transparent',
                      }}
                      aria-hidden="true"
                    />

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-[13px] truncate${thread.unread ? ' font-semibold' : ''}`}
                          style={{ color: 'var(--text)' }}
                        >
                          {thread.name}
                        </span>
                        <span
                          className="text-[11px] shrink-0"
                          style={{ color: 'var(--muted)' }}
                        >
                          {relativeTime(thread.lastMessageAt)}
                        </span>
                      </div>
                      <p
                        className="text-[12px] truncate"
                        style={{ color: 'var(--muted)' }}
                      >
                        {thread.email}
                      </p>
                      {thread.lastSnippet && (
                        <p
                          className="text-[12px] truncate mt-0.5"
                          style={{ color: 'var(--muted)' }}
                        >
                          {thread.lastSnippet}
                        </p>
                      )}
                    </div>

                    {/* Hover arrow */}
                    <ArrowRight
                      size={13}
                      aria-hidden="true"
                      className="shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
                      style={{ color: 'var(--muted)' }}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            {/* View all footer */}
            <div
              className="px-5 py-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <Link
                href="/admin/messages"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity duration-150 hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                View all messages
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </AdminCard>
    </section>
  );
}

// ── DashboardContent ──────────────────────────────────────────

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

      {/* Messages at-a-glance panel */}
      <MessagesPanel />

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
