// ============================================================
//  lib/contact-link-types.ts — Canonical contact link types.
//  Single source of truth for every recognised link type,
//  its display label, and its Lucide icon component.
//
//  Derived exports:
//    CONTACT_LINK_TYPE_OPTIONS  — {value, label}[] for <select>
//    CONTACT_LINK_ICON_MAP      — Record<string, LucideIcon> for rendering
//
//  Consumers:
//    - components/admin/section-data-form.tsx  (replaces LINK_TYPE_OPTIONS)
//    - components/sections/contact-section.tsx (replaces LINK_ICONS)
//    - components/layout/footer.tsx            (social icon lookup)
// ============================================================

import {
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  FileText,
  Send,
  ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ContactLinkType {
  value: string;
  label: string;
  /** Lucide icon component rendered in the UI. */
  icon: LucideIcon;
}

/**
 * Master list of all recognised contact/social link types.
 * Every entry has a Lucide icon; unknown types fall back to
 * ExternalLink at the usage site.
 */
export const CONTACT_LINK_TYPES: ContactLinkType[] = [
  { value: 'email',     label: 'Email',        icon: Mail         },
  { value: 'phone',     label: 'Phone',         icon: Phone        },
  { value: 'website',   label: 'Website',       icon: Globe        },
  { value: 'linkedin',  label: 'LinkedIn',      icon: Linkedin     },
  { value: 'github',    label: 'GitHub',        icon: Github       },
  { value: 'twitter',   label: 'X (Twitter)',   icon: Twitter      },
  { value: 'instagram', label: 'Instagram',     icon: Instagram    },
  { value: 'youtube',   label: 'YouTube',       icon: Youtube      },
  { value: 'medium',    label: 'Medium',        icon: ExternalLink },
  { value: 'dribbble',  label: 'Dribbble',      icon: ExternalLink },
  { value: 'telegram',  label: 'Telegram',      icon: Send         },
  { value: 'resume',    label: 'Resume / CV',   icon: FileText     },
];

/**
 * Derived: {value, label}[] options array for form <select> elements.
 * Typed as ConfigOption-compatible (matches lib/api ConfigOption shape).
 */
export const CONTACT_LINK_TYPE_OPTIONS: { value: string; label: string }[] =
  CONTACT_LINK_TYPES.map(({ value, label }) => ({ value, label }));

/**
 * Derived: icon lookup by type value.
 * Typed with `| undefined` so callers can safely use `?? ExternalLink`
 * as a fallback for any type not in this list.
 */
export const CONTACT_LINK_ICON_MAP: Record<string, LucideIcon | undefined> =
  Object.fromEntries(CONTACT_LINK_TYPES.map(({ value, icon }) => [value, icon]));
