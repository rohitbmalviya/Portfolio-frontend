// ============================================================
//  Tag / Chip / Pill — three variants used across the design.
//  Server component.
// ============================================================

import { cn } from '@/lib/utils';

// Small mono bordered tag (project cards)
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] text-[--muted] border border-[--border]',
        'px-[9px] py-[3px] rounded-[6px]',
        className,
      )}
    >
      {children}
    </span>
  );
}

// Larger chip (skills grid)
export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block font-mono text-[13px] text-[--text] bg-[--surface-2]',
        'border border-[--border] px-[11px] py-[5px] rounded-[8px]',
        className,
      )}
    >
      {children}
    </span>
  );
}

// Accent pill (card status label)
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] text-[--accent] bg-[--accent-dim]',
        'px-[9px] py-[4px] rounded-full',
        className,
      )}
    >
      {children}
    </span>
  );
}
