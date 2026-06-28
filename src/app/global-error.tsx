'use client';

// Last-resort boundary — catches errors in the ROOT layout itself.
// It replaces the root layout, so it must render its own <html>/<body>
// and cannot rely on the theme CSS variables (uses inline styles).

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0e14',
          color: '#e6edf3',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            style={{
              fontFamily: 'monospace',
              color: '#22d3ee',
              letterSpacing: 2,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            // error
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 16px', letterSpacing: -1 }}>
            Something went wrong.
          </h1>
          <p style={{ color: '#8b949e', fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
            A critical error occurred while loading the app. Please try again.
            {error?.digest ? ` (ref: ${error.digest})` : ''}
          </p>
          <button
            onClick={reset}
            style={{
              background: '#22d3ee',
              color: '#0a0e14',
              border: 'none',
              borderRadius: 8,
              padding: '12px 22px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
