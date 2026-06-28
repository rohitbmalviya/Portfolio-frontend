'use client';

// Root segment error boundary — catches errors that bubble past the
// route-group boundaries (e.g. a group layout throwing). Rendered
// inside the root layout, so global styles/theme are available.

import { ErrorState } from '@/components/ui/error-state';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} variant="public" />;
}
