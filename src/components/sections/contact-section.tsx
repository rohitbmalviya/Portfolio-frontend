// ============================================================
//  ContactSection — mailto CTA + social links + resume download.
//  Server component.
// ============================================================

import { Mail, Github, Linkedin, Twitter, Download, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { LinkButton } from '@/components/ui/button';
import type { ContactData } from '@/lib/types';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number; 'aria-hidden'?: 'true' }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
};

interface ContactSectionProps {
  data: ContactData;
  sectionNumber?: string;
}

export function ContactSection({ data, sectionNumber }: ContactSectionProps) {
  const email = data.email ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'rohitbmalviya@gmail.com';
  const resumeUrl = data.resumeUrl ?? '/resume.pdf';

  return (
    <section className="py-16" id="contact" aria-labelledby="contact-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || "Let's build something."} />

        <div className="max-w-[580px] space-y-6">
          {data.blurb && (
            <p className="text-[--muted] text-[16px] leading-[1.7]">{data.blurb}</p>
          )}

          {/* Primary email CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <LinkButton
              href={`mailto:${email}`}
              variant="primary"
              aria-label={`Send email to ${email}`}
            >
              <Mail size={16} aria-hidden="true" />
              {email}
            </LinkButton>

            {resumeUrl && (
              <LinkButton
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                aria-label="Download resume PDF"
              >
                <Download size={16} aria-hidden="true" />
                Download résumé
              </LinkButton>
            )}
          </div>

          {/* Location */}
          <p className="flex items-center gap-2 font-mono text-[13px] text-[--muted]">
            <MapPin size={14} aria-hidden="true" />
            Pune, India
          </p>

          {/* Social links */}
          {data.socials && Object.keys(data.socials).length > 0 && (
            <div className="flex items-center gap-5">
              {Object.entries(data.socials).map(([key, href]) => {
                if (!href) return null;
                const Icon = SOCIAL_ICONS[key.toLowerCase()] ?? Mail;
                return (
                  <a
                    key={key}
                    href={href}
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
                    className="text-[--muted] hover:text-[--accent] transition-colors duration-150 flex items-center gap-2 font-mono text-[13px]"
                  >
                    <Icon size={16} aria-hidden="true" />
                    {key}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
