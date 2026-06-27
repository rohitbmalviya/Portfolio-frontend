// ============================================================
//  EducationSection — entries from the Education table.
//  Honors the section's selection filter (all vs selected).
//  Falls back to legacy inline items for old sections.
//  Server component.
// ============================================================

import { GraduationCap } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { getEducation } from '@/lib/api';
import type { EducationData, Education, EducationItem } from '@/lib/types';

interface EducationSectionProps {
  data: EducationData;
  sectionNumber?: string;
}

// ── Period display helpers ────────────────────────────────────

function yr(d: string): number {
  return new Date(d).getFullYear();
}

/** Compute the human-readable period string.
 *  Table entries have startDate/endDate; legacy inline items have period.
 */
type LegacyDisplayItem = EducationItem & { id: string; order: number };
type DisplayItem = Education | LegacyDisplayItem;

function getPeriodText(item: DisplayItem): string {
  if ('startDate' in item) {
    // Table-backed Education — derive year range from ISO dates
    return `${yr(item.startDate)} – ${item.endDate ? yr(item.endDate) : 'Present'}`;
  }
  // Legacy EducationItem — use the stored period string directly
  return item.period;
}

export async function EducationSection({ data, sectionNumber }: EducationSectionProps) {
  const fetched = await getEducation();

  // Honor selection filter; default (mode absent or 'all') = show everything
  const fromTable =
    data.mode === 'selected' && data.ids && data.ids.length > 0
      ? (() => {
          const idSet = new Set(data.ids);
          return fetched.filter((e) => idSet.has(e.id));
        })()
      : fetched;

  // Backward-compat: render legacy inline items only when the table is empty
  const items: DisplayItem[] =
    fromTable.length > 0
      ? fromTable
      : (data.items ?? []).map((it, i) => ({ id: `legacy-${i}`, order: i, ...it }));

  return (
    <section className="py-16" id="education" aria-labelledby="education-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Education'} />
        <div className="space-y-4 max-w-[640px]">
          {items.map((item) => {
            // logo is only present on table-backed Education items (not legacy inline items)
            const logo = 'logo' in item ? item.logo : null;

            return (
              <div
                key={item.id}
                className="bg-[--surface] border border-[--border] rounded-[14px] p-5 flex gap-4"
              >
                {/* Icon slot — institution logo if available, otherwise GraduationCap */}
                <div className="w-10 h-10 shrink-0 rounded-[10px] overflow-hidden flex items-center justify-center">
                  {logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={logo}
                      alt={`${item.school} logo`}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[--accent-dim] flex items-center justify-center text-[--accent]">
                      <GraduationCap size={16} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[17px] text-[--text] mb-1">{item.degree}</h3>
                  <p className="text-[--muted] text-[14px]">{item.school}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-[12px] text-[--accent]">{getPeriodText(item)}</span>
                    {item.detail && (
                      <>
                        <span className="text-[--border]">·</span>
                        <span className="text-[13px] text-[--muted]">{item.detail}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
