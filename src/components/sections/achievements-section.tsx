// ============================================================
//  AchievementsSection — awards, education, mentoring.
//  Server component.
// ============================================================

import { Trophy, GraduationCap, Users } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { getAchievements } from '@/lib/api';
import { FALLBACK_ACHIEVEMENTS } from '@/lib/fallback-data';
import type { AchievementsData, AchievementType } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ACHIEVEMENT_ICONS: Record<AchievementType, React.ComponentType<any>> = {
  AWARD: Trophy,
  EDUCATION: GraduationCap,
  MENTORING: Users,
};

interface AchievementsSectionProps {
  data: AchievementsData;
  sectionNumber?: string;
}

export async function AchievementsSection({ data, sectionNumber }: AchievementsSectionProps) {
  let achievements = await getAchievements();
  if (achievements.length === 0) achievements = FALLBACK_ACHIEVEMENTS;

  return (
    <section className="py-16" id="achievements" aria-labelledby="achievements-heading">
      <div className="wrap">
        <SectionHeading number={sectionNumber} title={data.heading || 'Achievements & Education'} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[900px]">
          {achievements.map((item) => {
            const Icon = ACHIEVEMENT_ICONS[item.type];
            return (
              <div
                key={item.id}
                className="bg-[--surface] border border-[--border] rounded-[14px] p-5 flex flex-col gap-3"
              >
                <div className="w-9 h-9 rounded-[10px] bg-[--accent-dim] flex items-center justify-center text-[--accent]">
                  <Icon size={16} aria-hidden={true} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[16px] text-[--text] mb-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[--muted] text-[13px] leading-[1.55]">{item.description}</p>
                  {item.year && (
                    <p className="font-mono text-[11px] text-[--accent] mt-2">{item.year}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
