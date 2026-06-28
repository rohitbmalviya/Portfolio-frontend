// ============================================================
//  Footer — mono text, centered, nav links + socials.
//  Social links and email are sourced from SiteSettings when
//  available; falls back to DEFAULT_SOCIAL_LINKS when null.
//  Server component.
// ============================================================

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { CONTACT_LINK_ICON_MAP } from '@/lib/contact-link-types';
import { SITE_OWNER } from '@/lib/site';
import type { SiteSettings } from '@/lib/types';

// ── Static fallback (used when settings are null) ─────────────

/** Default social links when SiteSettings cannot be fetched. */
const DEFAULT_SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/rohithumancloud',
    icon: CONTACT_LINK_ICON_MAP['github'] ?? ExternalLink,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/rohitbmalviya',
    icon: CONTACT_LINK_ICON_MAP['linkedin'] ?? ExternalLink,
  },
  {
    label: 'Email',
    href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'rohitbmalviya@gmail.com'}`,
    icon: CONTACT_LINK_ICON_MAP['email'] ?? ExternalLink,
  },
];

const FOOTER_LINKS = [
  { label: 'about', href: '/#about' },
  { label: 'work', href: '/#work' },
  { label: 'blog', href: '/blog' },
  { label: 'contact', href: '/#contact' },
];

// ── Component ─────────────────────────────────────────────────

interface FooterProps {
  /** Passed from the public layout after fetching getSiteSettings(). */
  settings?: SiteSettings | null;
}

export function Footer({ settings }: FooterProps) {
  // Build social links from SiteSettings when available.
  // Include the primary email as a link if it isn't already listed in socials.
  const socialLinks = (() => {
    if (!settings || settings.socials.length === 0) return DEFAULT_SOCIAL_LINKS;

    const links = settings.socials.map((s) => {
      const Icon = CONTACT_LINK_ICON_MAP[s.type] ?? ExternalLink;
      const href = s.type === 'email' ? `mailto:${s.value}` : s.value;
      const label = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      return { label, href, icon: Icon };
    });

    // Append email link from settings.email only if not already present in socials.
    const hasEmail = settings.socials.some((s) => s.type === 'email');
    if (!hasEmail && settings.email) {
      const MailIcon = CONTACT_LINK_ICON_MAP['email'] ?? ExternalLink;
      links.push({ label: 'Email', href: `mailto:${settings.email}`, icon: MailIcon });
    }

    return links;
  })();

  return (
    <footer className="border-t border-[--border] py-10">
      <div className="wrap flex flex-col items-center gap-5 text-[--muted] font-mono text-[13px]">
        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-5 list-none">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="hover:text-[--text] transition-colors duration-150"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              aria-label={label}
              className="text-[--muted] hover:text-[--accent] transition-colors duration-150"
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center leading-relaxed">
          {settings?.footerText ?? (
            <>
              Designed &amp; built by{' '}
              <span className="text-[--accent]">{SITE_OWNER}</span>
              {' — '}Next.js + Tailwind
            </>
          )}
          {' · '}
          <span>© {new Date().getFullYear()}</span>
        </p>
      </div>
    </footer>
  );
}
