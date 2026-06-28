// ============================================================
//  Root Layout — fonts, theme, metadata defaults, providers.
//  The inline <script> sets data-theme BEFORE first paint
//  to prevent the flash of wrong theme (FOWT).
// ============================================================

import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SITE_OWNER, SITE_TITLE, SITE_TITLE_TEMPLATE } from '@/lib/site';
import './globals.css';

// ── Fonts via next/font (self-hosted subset, no external request) ──

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// ── Metadata defaults ─────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rohitmalviya.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: SITE_TITLE_TEMPLATE,
  },
  description:
    'Full-stack engineer (2+ yrs) building production SaaS & bank-grade systems across TypeScript, Go, Python & Java. Architected a Monte Carlo platform for Siam Commercial Bank.',
  authors: [{ name: SITE_OWNER, url: SITE_URL }],
  creator: SITE_OWNER,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_OWNER,
    title: SITE_TITLE,
    description:
      'Full-stack engineer building production SaaS & bank-grade systems across TypeScript, Go, Python & Java.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: 'Full-stack engineer building production SaaS & bank-grade systems.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    // These hex values mirror --bg in globals.css (dark: #0B0F17, light: #F2F5FA).
    // If --bg changes, update these to match.
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
    { media: '(prefers-color-scheme: light)', color: '#F2F5FA' },
  ],
};

// ── No-flash theme script ─────────────────────────────────────

// This runs synchronously before any CSS/JS loads, so the
// user never sees the wrong theme on first paint.
const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t){var def='${process.env.NEXT_PUBLIC_DEFAULT_THEME ?? 'dark'}'.toLowerCase();t=def==='light'?'light':(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

// ── Layout ────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* No-flash inline script — MUST be before any stylesheet or React hydration */}
        <script
          dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
