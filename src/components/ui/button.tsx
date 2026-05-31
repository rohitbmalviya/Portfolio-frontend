// ============================================================
//  Button — primary (accent) + ghost variants from step2 §7.
//  Renders as <button> by default; pass `asChild` to wrap a link.
// ============================================================

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold text-[14px]',
    'rounded-[10px] border transition-all duration-200 cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--accent]',
  ];

  const variants = {
    primary: [
      'bg-[--accent-dim] border-[--accent] text-[--accent]',
      'hover:shadow-[0_0_24px_var(--accent-glow)] hover:-translate-y-[2px]',
    ],
    ghost: [
      'bg-transparent border-[--border] text-[--muted]',
      'hover:text-[--text] hover:border-[--muted]',
    ],
  };

  const sizes = {
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-[22px] py-[12px]',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Anchor variant — wraps <a> with the same styling
interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: LinkButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold text-[14px]',
    'rounded-[10px] border transition-all duration-200 cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--accent]',
  ];

  const variants = {
    primary: [
      'bg-[--accent-dim] border-[--accent] text-[--accent]',
      'hover:shadow-[0_0_24px_var(--accent-glow)] hover:-translate-y-[2px]',
    ],
    ghost: [
      'bg-transparent border-[--border] text-[--muted]',
      'hover:text-[--text] hover:border-[--muted]',
    ],
  };

  const sizes = {
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-[22px] py-[12px]',
  };

  return (
    <a
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </a>
  );
}
