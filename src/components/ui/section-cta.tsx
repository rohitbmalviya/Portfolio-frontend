// ============================================================
//  SectionCta — text-link CTA with arrow, used at the bottom
//  of section components in place of the button-style LinkButton.
//  Server component (no interactivity required).
// ============================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionCtaProps {
  cta?: { label: string; href: string } | null;
}

export function SectionCta({ cta }: SectionCtaProps) {
  if (!cta?.label || !cta?.href) return null;
  return (
    <div className="mt-8 text-center">
      <Link
        href={cta.href}
        className="group inline-flex items-center gap-1.5 font-mono text-[14px] text-[--accent] hover:text-[--text] transition-colors"
      >
        {cta.label}
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
