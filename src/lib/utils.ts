// ============================================================
//  lib/utils.ts — Small utility helpers
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string to "Month YYYY". */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'Present') return dateStr;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Format an ISO date string for blog posts. */
export function formatBlogDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Map ProofType to a human-readable label and the pill style.
 */
export function proofLabel(proofType: string): string {
  switch (proofType) {
    case 'LIVE_DEMO':
      return 'live demo';
    case 'LIVE_LOGIN':
      return 'live (login)';
    case 'ARCHITECTURE':
      return 'architecture';
    default:
      return '';
  }
}

/** Truncate a string to maxLen characters, appending "…". */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}

/** Group an array by a key. */
export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

/** Format reading time from minutes. */
export function readingTimeLabel(minutes: number | null | undefined): string {
  if (!minutes) return '';
  return `${minutes} min read`;
}

/** Skill level order for sorting. */
export const SKILL_LEVEL_ORDER: Record<string, number> = {
  EXPERT: 0,
  PROFICIENT: 1,
  FAMILIAR: 2,
};
