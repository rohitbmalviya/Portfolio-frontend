// ============================================================
//  not-found.tsx — On-brand 404 page. No layout injection
//  needed — Next.js uses the nearest layout automatically.
// ============================================================

import Link from 'next/link';
import { LinkButton } from '@/components/ui/button';
import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main
        className="min-h-[70vh] flex flex-col items-center justify-center py-24 text-center"
        id="main-content"
      >
        <div className="wrap max-w-[520px] mx-auto">
          {/* Mono 404 */}
          <p className="font-mono text-[--accent] text-[13px] tracking-[2px] mb-4">// 404</p>

          <h1
            className="font-display font-bold leading-[1.05] tracking-[-1.5px] mb-5"
            style={{ fontSize: 'clamp(48px, 8vw, 80px)' }}
          >
            <span className="bg-gradient-to-r from-[--grad-from] to-[--grad-to] bg-clip-text text-transparent">
              Not found.
            </span>
          </h1>

          <p className="text-[--muted] text-[18px] leading-relaxed mb-8">
            This page doesn&apos;t exist. It may have moved, or the URL is wrong. Let&apos;s get you back
            on track.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <LinkButton href="/" variant="primary">
              ← Home
            </LinkButton>
            <LinkButton href="/projects" variant="ghost">
              Projects
            </LinkButton>
            <LinkButton href="/blog" variant="ghost">
              Blog
            </LinkButton>
          </div>

          {/* Decorative mono line */}
          <p className="font-mono text-[12px] text-[--border] mt-12">
            rohit.malviya · 404 · page not found
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
