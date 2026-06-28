'use client';

// ============================================================
//  ErrorState — shared, on-brand error-boundary UI.
//  Used by the route-segment error.tsx files. Logs the error
//  on mount and offers a reset ("Try again") + a way back.
// ============================================================

import { useEffect } from 'react';
import { Button, LinkButton } from '@/components/ui/button';

export function ErrorState({
  error,
  reset,
  variant = 'public',
}: {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: 'public' | 'admin';
}) {
  useEffect(() => {
    // Surface for debugging / future error-reporting hook.
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center py-24 text-center"
      id="main-content"
    >
      <div className="wrap max-w-[520px] mx-auto">
        <p className="font-mono text-[--accent] text-[13px] tracking-[2px] mb-4">{'// error'}</p>

        <h1
          className="font-display font-bold leading-[1.05] tracking-[-1.5px] mb-5"
          style={{ fontSize: 'clamp(40px, 7vw, 68px)' }}
        >
          <span className="bg-gradient-to-r from-[--grad-from] to-[--grad-to] bg-clip-text text-transparent">
            Something went wrong.
          </span>
        </h1>

        <p className="text-[--muted] text-[17px] leading-relaxed mb-8">
          An unexpected error occurred while loading this {variant === 'admin' ? 'page' : 'content'}.
          Try again — if it keeps happening, check back shortly.
          {error?.digest ? (
            <span className="block font-mono text-[12px] text-[--border] mt-3">ref: {error.digest}</span>
          ) : null}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <LinkButton href={variant === 'admin' ? '/admin' : '/'} variant="ghost">
            {variant === 'admin' ? 'Dashboard' : 'Home'}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
