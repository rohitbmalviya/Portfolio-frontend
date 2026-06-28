'use client';

// Error boundary for public pages — rendered inside the public layout
// (Nav + Footer remain), so only the page content is replaced.

import { ErrorState } from '@/components/ui/error-state';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} variant="public" />;
}
