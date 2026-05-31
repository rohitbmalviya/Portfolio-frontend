'use client';

// ============================================================
//  ThemeToggle — sun/moon button that switches dark ↔ light.
//  Sun icon shown in dark mode (click → go light).
//  Moon icon shown in light mode (click → go dark).
//  Matches sample-a-refined-dark.html exactly.
// ============================================================

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'w-[38px] h-[38px] rounded-[10px] border grid place-items-center cursor-pointer',
        'transition-colors duration-200',
        'text-[--muted] border-[--border] bg-[--surface]',
        'hover:text-[--accent] hover:border-[--accent]',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun size={18} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon size={18} strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}
