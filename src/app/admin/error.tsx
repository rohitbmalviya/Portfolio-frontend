'use client';

// Error boundary for admin pages — rendered inside the admin layout.

import { ErrorState } from '@/components/ui/error-state';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} variant="admin" />;
}
