'use client';

// ============================================================
//  SkillIcon — DYNAMIC Simple Icons, fetched + inlined.
//  The slug is derived from the skill `name` (skillSlug), then
//  fetched from https://cdn.simpleicons.org/<slug> and inlined.
//
//  Why fetch instead of <img>? An <img> pointing at a missing
//  slug logs a red "GET … 404" to the console for every brand
//  Simple Icons doesn't have. fetch() reads the 404 status
//  silently (no console error), so unmatched skills render
//  nothing — cleanly. The CDN sends `access-control-allow-origin: *`,
//  so the cross-origin fetch is allowed.
// ============================================================

import { useEffect, useState } from 'react';

// Derived-slug → actual Simple Icons slug, where a naive derivation
// doesn't match the real brand slug. Keyed by the output of the
// base derivation below.
const SLUG_ALIASES: Record<string, string> = {
  gemini: 'googlegemini',
  gcp: 'googlecloud',
  angular1819: 'angular',
  angular18: 'angular',
  angular19: 'angular',
  gingo: 'gin',
  nodedotjsexpress: 'nodedotjs',
  langchainlanggraph: 'langchain',
};

/**
 * Approximates Simple Icons' title→slug rules so a typed tech name
 * resolves to its CDN slug (e.g. "Next.js" → "nextdotjs",
 * "C++" → "cplusplus", ".NET" → "dotnet", "Tailwind CSS" → "tailwindcss"),
 * then applies known aliases for brands whose slug differs.
 */
export function skillSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\./g, 'dot')
    .replace(/&/g, 'and')
    .replace(/#/g, 'sharp')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]/g, ''); // drop anything else (spaces, slashes, …)
  return SLUG_ALIASES[base] ?? base;
}

// Module-level cache: slug → SVG markup, or null when the brand is absent.
// `undefined` (key missing) = not fetched yet.
const iconCache = new Map<string, string | null>();

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
  const [svg, setSvg] = useState<string | null>(() =>
    slug ? iconCache.get(slug) ?? null : null,
  );

  useEffect(() => {
    if (!slug) {
      setSvg(null);
      return;
    }
    const cached = iconCache.get(slug);
    if (cached !== undefined) {
      setSvg(cached);
      return;
    }

    let active = true;
    fetch(`https://cdn.simpleicons.org/${slug}`)
      // res.ok === false (e.g. 404) resolves normally — no console error.
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        iconCache.set(slug, text);
        if (active) setSvg(text);
      })
      .catch(() => {
        // Network failure — treat as "no icon", silently.
        iconCache.set(slug, null);
        if (active) setSvg(null);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (!svg) return null;

  return (
    <span
      className={`shrink-0 inline-flex [&>svg]:block [&>svg]:w-full [&>svg]:h-full ${className ?? ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
      // SVG markup comes from the trusted Simple Icons CDN.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
