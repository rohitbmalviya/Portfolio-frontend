'use client';

// ============================================================
//  SectionDataForm — renders the correct form fields per
//  section type. One big switch on type → matching form.
// ============================================================

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SectionType, SectionData } from '@/lib/types';
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminToggle,
  AdminButton,
  BulletsInput,
} from './ui';
import { MultiImageUpload } from './image-upload';

interface Props {
  type: SectionType;
  data: SectionData;
  onChange: (data: SectionData) => void;
}

// ── Helpers ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function field<T>(
  data: AnyObj,
  onChange: (d: SectionData) => void,
  key: string,
  value: T,
) {
  onChange({ ...data, [key]: value } as SectionData);
}

// ── Forms per type ────────────────────────────────────────────

function HeroForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  const buttons: { label: string; href: string; style: string }[] = data.buttons ?? [];
  const metrics: { value: string; label: string }[] = data.metrics ?? [];

  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Eyebrow"
        value={data.eyebrow ?? ''}
        onChange={(e) => field(data, onChange, 'eyebrow', e.target.value)}
        placeholder="e.g. Full-Stack Engineer"
      />
      <AdminInput
        label="Name"
        value={data.name ?? ''}
        onChange={(e) => field(data, onChange, 'name', e.target.value)}
      />
      <AdminInput
        label="Gradient line"
        value={data.gradientLine ?? ''}
        onChange={(e) => field(data, onChange, 'gradientLine', e.target.value)}
        placeholder="e.g. I build production systems."
      />
      <AdminTextarea
        label="Subhead"
        value={data.subhead ?? ''}
        onChange={(e) => field(data, onChange, 'subhead', e.target.value)}
        rows={3}
      />

      {/* Buttons */}
      <div>
        <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--text)' }}>
          Buttons
        </p>
        <div className="flex flex-col gap-3">
          {buttons.map((btn, i) => (
            <div
              key={i}
              className="flex gap-2 items-start p-3 rounded-[10px] border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <AdminInput
                  placeholder="Label"
                  value={btn.label}
                  onChange={(e) => {
                    const next = [...buttons];
                    next[i] = { ...btn, label: e.target.value };
                    field(data, onChange, 'buttons', next);
                  }}
                />
                <AdminInput
                  placeholder="href"
                  value={btn.href}
                  onChange={(e) => {
                    const next = [...buttons];
                    next[i] = { ...btn, href: e.target.value };
                    field(data, onChange, 'buttons', next);
                  }}
                />
                <AdminSelect
                  value={btn.style}
                  onChange={(e) => {
                    const next = [...buttons];
                    next[i] = { ...btn, style: e.target.value };
                    field(data, onChange, 'buttons', next);
                  }}
                  options={[
                    { value: 'primary', label: 'Primary' },
                    { value: 'ghost', label: 'Ghost' },
                  ]}
                />
              </div>
              <button
                type="button"
                onClick={() => field(data, onChange, 'buttons', buttons.filter((_, j) => j !== i))}
                aria-label="Remove button"
                className="mt-1"
                style={{ color: 'var(--muted)' }}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() =>
              field(data, onChange, 'buttons', [
                ...buttons,
                { label: '', href: '', style: 'primary' },
              ])
            }
            type="button"
          >
            <Plus size={14} aria-hidden="true" /> Add button
          </AdminButton>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--text)' }}>
          Metrics
        </p>
        <div className="flex flex-col gap-2">
          {metrics.map((m, i) => (
            <div key={i} className="flex gap-2 items-start">
              <AdminInput
                placeholder="Value (e.g. 5+)"
                value={m.value}
                onChange={(e) => {
                  const next = [...metrics];
                  next[i] = { ...m, value: e.target.value };
                  field(data, onChange, 'metrics', next);
                }}
              />
              <AdminInput
                placeholder="Label"
                value={m.label}
                onChange={(e) => {
                  const next = [...metrics];
                  next[i] = { ...m, label: e.target.value };
                  field(data, onChange, 'metrics', next);
                }}
              />
              <button
                type="button"
                onClick={() => field(data, onChange, 'metrics', metrics.filter((_, j) => j !== i))}
                aria-label="Remove metric"
                className="mt-2.5"
                style={{ color: 'var(--muted)' }}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() =>
              field(data, onChange, 'metrics', [
                ...metrics,
                { value: '', label: '' },
              ])
            }
            type="button"
          >
            <Plus size={14} aria-hidden="true" /> Add metric
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

function AboutForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  const paragraphs: string[] = data.paragraphs ?? [''];

  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <div>
        <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--text)' }}>
          Paragraphs
        </p>
        {paragraphs.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <AdminTextarea
              value={p}
              onChange={(e) => {
                const next = [...paragraphs];
                next[i] = e.target.value;
                field(data, onChange, 'paragraphs', next);
              }}
              rows={3}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() =>
                field(data, onChange, 'paragraphs', paragraphs.filter((_, j) => j !== i))
              }
              aria-label="Remove paragraph"
              className="mt-2"
              style={{ color: 'var(--muted)' }}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <AdminButton
          variant="ghost"
          size="sm"
          onClick={() => field(data, onChange, 'paragraphs', [...paragraphs, ''])}
          type="button"
        >
          <Plus size={14} aria-hidden="true" /> Add paragraph
        </AdminButton>
      </div>
    </div>
  );
}

function SkillsForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <AdminSelect
        label="Source"
        value={data.source ?? 'skills-table'}
        onChange={(e) => field(data, onChange, 'source', e.target.value)}
        options={[
          { value: 'skills-table', label: 'From Skills table (managed in Skills section)' },
          { value: 'inline', label: 'Inline groups (defined here)' },
        ]}
      />
      <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
        Using &quot;Skills table&quot; will pull data from the Skills CRUD section automatically.
      </p>
    </div>
  );
}

function ExperienceForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
        Data is pulled from the Experience table automatically.
      </p>
    </div>
  );
}

function FeaturedProjectsForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <AdminSelect
        label="Source"
        value={data.auto ?? 'featured'}
        onChange={(e) => field(data, onChange, 'auto', e.target.value)}
        options={[
          { value: 'featured', label: 'Auto: use featured projects' },
        ]}
      />
      <AdminInput
        label="Limit"
        type="number"
        value={data.limit ?? 3}
        onChange={(e) => field(data, onChange, 'limit', Number(e.target.value))}
        min={1}
        max={10}
      />
    </div>
  );
}

function ProjectsGridForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <AdminInput
        label="Filter (all / featured / tag name)"
        value={data.filter ?? 'all'}
        onChange={(e) => field(data, onChange, 'filter', e.target.value)}
      />
      <AdminInput
        label="Limit"
        type="number"
        value={data.limit ?? ''}
        onChange={(e) =>
          field(data, onChange, 'limit', e.target.value ? Number(e.target.value) : undefined)
        }
        placeholder="Leave empty for all"
      />
    </div>
  );
}

function BlogTeaserForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <AdminInput
        label="Limit"
        type="number"
        value={data.limit ?? 3}
        onChange={(e) => field(data, onChange, 'limit', Number(e.target.value))}
        min={1}
        max={10}
      />
    </div>
  );
}

function AchievementsForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
        Data is pulled from the Achievements table automatically.
      </p>
    </div>
  );
}

function EducationForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  const items: { degree: string; school: string; period: string; detail?: string }[] = data.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <div>
        <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--text)' }}>
          Education Items
        </p>
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-[10px] border flex flex-col gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
            >
              <div className="grid grid-cols-2 gap-2">
                <AdminInput
                  placeholder="Degree"
                  value={item.degree}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, degree: e.target.value };
                    field(data, onChange, 'items', next);
                  }}
                />
                <AdminInput
                  placeholder="School"
                  value={item.school}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, school: e.target.value };
                    field(data, onChange, 'items', next);
                  }}
                />
                <AdminInput
                  placeholder="Period (e.g. 2020–2024)"
                  value={item.period}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, period: e.target.value };
                    field(data, onChange, 'items', next);
                  }}
                />
                <AdminInput
                  placeholder="Detail (optional)"
                  value={item.detail ?? ''}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, detail: e.target.value };
                    field(data, onChange, 'items', next);
                  }}
                />
              </div>
              <div className="flex justify-end">
                <AdminButton
                  size="sm"
                  variant="danger"
                  onClick={() => field(data, onChange, 'items', items.filter((_, j) => j !== i))}
                  type="button"
                >
                  Remove
                </AdminButton>
              </div>
            </div>
          ))}
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() =>
              field(data, onChange, 'items', [
                ...items,
                { degree: '', school: '', period: '', detail: '' },
              ])
            }
            type="button"
          >
            <Plus size={14} aria-hidden="true" /> Add education
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

function ContactForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <AdminTextarea
        label="Blurb"
        value={data.blurb ?? ''}
        onChange={(e) => field(data, onChange, 'blurb', e.target.value)}
        rows={3}
      />
      <AdminInput
        label="Email"
        type="email"
        value={data.email ?? ''}
        onChange={(e) => field(data, onChange, 'email', e.target.value)}
      />
      <AdminInput
        label="Resume URL"
        value={data.resumeUrl ?? ''}
        onChange={(e) => field(data, onChange, 'resumeUrl', e.target.value)}
      />
      <AdminToggle
        label="Show contact form"
        checked={data.showForm ?? false}
        onChange={(v) => field(data, onChange, 'showForm', v)}
      />
    </div>
  );
}

function MetricsForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  const items: { value: string; label: string }[] = data.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <AdminInput
              placeholder="Value (e.g. 5+)"
              value={item.value}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, value: e.target.value };
                field(data, onChange, 'items', next);
              }}
            />
            <AdminInput
              placeholder="Label"
              value={item.label}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, label: e.target.value };
                field(data, onChange, 'items', next);
              }}
            />
            <button
              type="button"
              onClick={() =>
                field(data, onChange, 'items', items.filter((_, j) => j !== i))
              }
              aria-label="Remove metric"
              className="mt-2.5"
              style={{ color: 'var(--muted)' }}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <AdminButton
          variant="ghost"
          size="sm"
          onClick={() =>
            field(data, onChange, 'items', [...items, { value: '', label: '' }])
          }
          type="button"
        >
          <Plus size={14} aria-hidden="true" /> Add metric
        </AdminButton>
      </div>
    </div>
  );
}

function RichTextForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading (optional)"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <AdminTextarea
        label="Body (MDX / rich text)"
        value={data.body ?? ''}
        onChange={(e) => field(data, onChange, 'body', e.target.value)}
        rows={10}
        style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '13px' }}
      />
    </div>
  );
}

function CtaForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  const button = data.button ?? { label: '', href: '' };
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <AdminTextarea
        label="Text"
        value={data.text ?? ''}
        onChange={(e) => field(data, onChange, 'text', e.target.value)}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-3">
        <AdminInput
          label="Button label"
          value={button.label}
          onChange={(e) => field(data, onChange, 'button', { ...button, label: e.target.value })}
        />
        <AdminInput
          label="Button href"
          value={button.href}
          onChange={(e) => field(data, onChange, 'button', { ...button, href: e.target.value })}
        />
      </div>
    </div>
  );
}

function GalleryForm({ data, onChange }: { data: AnyObj; onChange: (d: SectionData) => void }) {
  const images = data.images ?? [];
  return (
    <div className="flex flex-col gap-4">
      <AdminInput
        label="Heading (optional)"
        value={data.heading ?? ''}
        onChange={(e) => field(data, onChange, 'heading', e.target.value)}
      />
      <MultiImageUpload
        label="Gallery images"
        value={images}
        onChange={(items) => field(data, onChange, 'images', items)}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function SectionDataForm({ type, data, onChange }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as Record<string, any>;

  switch (type) {
    case 'HERO':
      return <HeroForm data={d} onChange={onChange} />;
    case 'ABOUT':
      return <AboutForm data={d} onChange={onChange} />;
    case 'SKILLS':
      return <SkillsForm data={d} onChange={onChange} />;
    case 'EXPERIENCE':
      return <ExperienceForm data={d} onChange={onChange} />;
    case 'FEATURED_PROJECTS':
      return <FeaturedProjectsForm data={d} onChange={onChange} />;
    case 'PROJECTS_GRID':
      return <ProjectsGridForm data={d} onChange={onChange} />;
    case 'BLOG_TEASER':
      return <BlogTeaserForm data={d} onChange={onChange} />;
    case 'ACHIEVEMENTS':
      return <AchievementsForm data={d} onChange={onChange} />;
    case 'EDUCATION':
      return <EducationForm data={d} onChange={onChange} />;
    case 'CONTACT':
      return <ContactForm data={d} onChange={onChange} />;
    case 'METRICS':
      return <MetricsForm data={d} onChange={onChange} />;
    case 'RICH_TEXT':
      return <RichTextForm data={d} onChange={onChange} />;
    case 'CTA':
      return <CtaForm data={d} onChange={onChange} />;
    case 'GALLERY':
      return <GalleryForm data={d} onChange={onChange} />;
    default:
      return (
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          No form defined for section type &quot;{type}&quot;.
        </p>
      );
  }
}
