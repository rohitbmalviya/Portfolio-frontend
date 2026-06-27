'use client';

// ============================================================
//  SkillIcon — DYNAMIC Simple Icons via the official CDN.
//  No hardcoded map, no manual slug — the slug is derived
//  straight from the skill `name` (skillSlug).
//  Renders https://cdn.simpleicons.org/<slug>. If the brand
//  isn't in Simple Icons, the request 404s → we hide it (no icon).
//  Brand-colored (CDN default).
// ============================================================

import { useState } from 'react';

/**
 * Approximates Simple Icons' title→slug rules so a typed tech name
 * resolves to its CDN slug (e.g. "Next.js" → "nextdotjs",
 * "C++" → "cplusplus", ".NET" → "dotnet", "Tailwind CSS" → "tailwindcss").
 */
export function skillSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\./g, 'dot')
    .replace(/&/g, 'and')
    .replace(/#/g, 'sharp')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]/g, ''); // drop anything else (spaces, slashes, …)
}

export function SkillIcon({
  name,
  size = 14,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const slug = name ? skillSlug(name) : '';
  const [hidden, setHidden] = useState(false);

  if (!slug || hidden) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.simpleicons.org/${slug}`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 ${className ?? ''}`}
      loading="lazy"
      onError={() => setHidden(true)}
    />
  );
}
