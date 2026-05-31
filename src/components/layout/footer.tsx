// ============================================================
//  Footer — mono text, centered, nav links + socials.
//  Server component.
// ============================================================

import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'about', href: '/#about' },
  { label: 'work', href: '/#work' },
  { label: 'blog', href: '/blog' },
  { label: 'contact', href: '/#contact' },
];

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/rohithumancloud',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/rohitbmalviya',
    icon: Linkedin,
  },
  {
    label: 'Email',
    href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'rohitbmalviya@gmail.com'}`,
    icon: Mail,
  },
];

export function Footer() {
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
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
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
          Designed &amp; built by{' '}
          <span className="text-[--accent]">Rohit Malviya</span>
          {' — '}Next.js + Tailwind
          {' · '}
          <span>© {new Date().getFullYear()}</span>
        </p>
      </div>
    </footer>
  );
}
