'use client';

// ============================================================
//  Nav — sticky, backdrop-blur, 64px, mono logo, nav links
//  with section numbers, theme toggle. Mobile: hamburger menu.
//
//  Links come from GET /api/pages/nav (fetched server-side in
//  the public layout and passed as `navItems`). When the list
//  is empty the nav bar still renders logo and theme toggle.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { SITE_OWNER } from '@/lib/site';
import type { NavPage } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────

interface NavLink {
  num: string;
  label: string;
  href: string;
}

function toNavLinks(pages: NavPage[]): NavLink[] {
  return pages.map((p, i) => ({
    num: String(i + 1).padStart(2, '0'),
    // Render navLabel if set, otherwise fall back to title; lowercase for style consistency
    label: (p.navLabel ?? p.title).toLowerCase(),
    href: p.slug === 'home' ? '/' : `/${p.slug}`,
  }));
}

// ── Component ─────────────────────────────────────────────────

interface NavProps {
  /** Pre-fetched nav pages from the server layout (GET /api/pages/nav). */
  navItems?: NavPage[];
}

export function Nav({ navItems }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const effectiveItems = navItems ?? [];
  const NAV_LINKS = toNavLinks(effectiveItems);

  return (
    <nav
      className={cn(
        'sticky top-0 z-20 backdrop-blur-[10px]',
        'bg-[--nav-bg] border-b border-[--border]',
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="wrap flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="font-mono font-medium tracking-[0.5px] text-[--text] hover:text-[--text] focus-visible:outline-[--accent]"
          aria-label={`${SITE_OWNER} — home`}
        >
          rohit<span className="text-[--accent]">.</span>malviya
        </Link>

        {/* Desktop nav links + toggle */}
        <div className="hidden md:flex items-center gap-[26px]">
          <ul className="flex gap-[26px] text-[14px] text-[--muted] list-none" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.num}>
                <Link
                  href={link.href}
                  className="hover:text-[--text] transition-colors duration-150 focus-visible:outline-[--accent]"
                >
                  <span className="font-mono text-[--accent] text-[12px] mr-[5px]" aria-hidden="true">
                    {link.num}
                  </span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>

        {/* Mobile: toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className={cn(
              'w-[38px] h-[38px] rounded-[10px] border grid place-items-center',
              'text-[--muted] border-[--border] bg-[--surface]',
              'hover:text-[--accent] hover:border-[--accent] transition-colors duration-200',
            )}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[--border] bg-[--surface] py-4"
          role="menu"
        >
          <ul className="flex flex-col gap-1 px-6 list-none" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.num} role="none">
                <Link
                  href={link.href}
                  role="menuitem"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 py-3 text-[15px] text-[--muted]',
                    'hover:text-[--text] transition-colors duration-150',
                    'border-b border-[--border] last:border-b-0',
                  )}
                >
                  <span className="font-mono text-[--accent] text-[12px]">{link.num}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
