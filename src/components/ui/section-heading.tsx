// ============================================================
//  SectionHeading — the "02. Selected Work ——————" pattern
//  from the design sample. Server component (no interactivity).
// ============================================================

import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  number?: string;   // e.g. "01"
  title: string;
  className?: string;
}

export function SectionHeading({ number, title, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex items-center gap-[14px] mb-9', className)}>
      {number && (
        <span
          className="font-mono text-[14px] text-[--accent]"
          aria-hidden="true"
        >
          {number}.
        </span>
      )}
      <h2 className="font-display font-semibold text-[26px] tracking-[-0.5px] text-[--text] whitespace-nowrap">
        {title}
      </h2>
      <span
        className="flex-1 h-px bg-[--border]"
        aria-hidden="true"
      />
    </div>
  );
}
