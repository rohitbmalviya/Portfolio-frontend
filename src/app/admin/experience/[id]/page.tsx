'use client';

// ============================================================
//  Experience create / edit form
//  Route: /admin/experience/new  →  create
//         /admin/experience/:id  →  edit
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminExperience } from '@/lib/admin-api';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ImageUpload } from '@/components/admin/image-upload';
import {
  AdminInput,
  AdminToggle,
  AdminButton,
  AdminCard,
  BulletsInput,
  LoadingRows,
} from '@/components/admin/ui';
import { DatePicker } from '@/components/admin/date-picker';

// ── Form state ─────────────────────────────────────────────────
// `present` is a UI-only flag; serialises to endDate: null when true.
// startDate / endDate are stored as YYYY-MM-DD strings (what <input type="date"> uses).

interface FormState {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  present: boolean;
  bullets: string[];
  order: number;
  logo: string;
}

const EMPTY_FORM: FormState = {
  role: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  present: false,
  bullets: [],
  order: 0,
  logo: '',
};

function ExperienceFormContent({ experienceId }: { experienceId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!experienceId);
  const [saving, setSaving] = useState(false);
  const isNew = !experienceId;

  // Load existing experience by id
  useEffect(() => {
    if (!experienceId) return;
    setLoading(true);
    adminExperience
      .get(experienceId)
      .then((exp) => {
        setForm({
          role: exp.role,
          company: exp.company,
          location: exp.location,
          // API may return a full ISO datetime — slice to YYYY-MM-DD for the date input
          startDate: exp.startDate ? exp.startDate.slice(0, 10) : '',
          endDate: exp.endDate ? exp.endDate.slice(0, 10) : '',
          // endDate === null means "Present / current role"
          present: exp.endDate === null,
          bullets: exp.bullets ?? [],
          order: exp.order,
          logo: exp.logo ?? '',
        });
      })
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load experience.'),
      )
      .finally(() => setLoading(false));
  }, [experienceId, toastError]);

  // Prefill order for brand-new entry: max(existing) + 1
  useEffect(() => {
    if (experienceId) return;
    adminExperience
      .list()
      .then((list) => {
        const maxOrder = list.length > 0 ? Math.max(...list.map((e) => e.order)) : -1;
        setForm((f) => ({ ...f, order: maxOrder + 1 }));
      })
      .catch(() => {});
  }, [experienceId]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role.trim() || !form.company.trim()) {
      toastError('Role and Company are required.');
      return;
    }
    if (!form.startDate) {
      toastError('Start date is required.');
      return;
    }
    if (!form.present && form.endDate && form.endDate < form.startDate) {
      toastError('End date cannot be before the start date.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        role: form.role.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        bullets: form.bullets,
        order: form.order,
        startDate: form.startDate,
        // present toggle → null; otherwise use the YYYY-MM-DD value (or null if empty)
        endDate: form.present ? null : (form.endDate || null),
        logo: form.logo || null,
      };
      if (isNew) {
        const created = await adminExperience.create(payload);
        success('Experience created.');
        router.replace(`/admin/experience/${created.id}`);
      } else {
        await adminExperience.update(experienceId!, payload);
        success('Experience saved.');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Loading…">
        <LoadingRows />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={isNew ? 'New Experience' : `Edit: ${form.role || 'Experience'}`}
      actions={
        <AdminButton loading={saving} onClick={handleSubmit} type="button">
          <Save size={14} aria-hidden="true" />
          {isNew ? 'Create experience' : 'Save changes'}
        </AdminButton>
      }
    >
      <Link
        href="/admin/experience"
        className="inline-flex items-center gap-1.5 text-[13px] mb-5 transition-colors hover:text-[var(--accent)]"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All experience
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
        {/* Role / Company / Location */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Role Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Role *"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              required
              autoFocus
            />
            <AdminInput
              label="Company *"
              value={form.company}
              onChange={(e) => set('company', e.target.value)}
              required
            />
            <AdminInput
              label="Location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Pune, India"
              className="sm:col-span-2"
            />
          </div>
          {/* Company logo — optional */}
          <div className="mt-4">
            <ImageUpload
              label="Company logo (optional)"
              hint="Recommended: square PNG/SVG, min 80×80. Stored via Cloudinary."
              value={form.logo || null}
              onChange={(url) => set('logo', url ?? '')}
            />
          </div>
        </AdminCard>

        {/* Dates */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Dates
          </h2>
          <div className="flex flex-col gap-4">
            <DatePicker
              label="Start date *"
              value={form.startDate}
              onChange={(v) => set('startDate', v)}
              required
            />
            <AdminToggle
              label="Present (current role)"
              checked={form.present}
              onChange={(v) => set('present', v)}
            />
            {!form.present && (
              <DatePicker
                label="End date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(v) => set('endDate', v)}
              />
            )}
          </div>
        </AdminCard>

        {/* Bullet points */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Bullet Points
          </h2>
          <BulletsInput
            label="Achievements & responsibilities"
            value={form.bullets}
            onChange={(b) => set('bullets', b)}
          />
        </AdminCard>

        {/* Order */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Display Order
          </h2>
          <AdminInput
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) => set('order', Number(e.target.value))}
            hint="Lower number appears first in the timeline"
          />
        </AdminCard>

        <div className="flex justify-end">
          <AdminButton loading={saving} type="submit">
            <Save size={14} aria-hidden="true" />
            {isNew ? 'Create experience' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </AdminShell>
  );
}

export default function AdminExperienceEditPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';

  return (
    <ToastProvider>
      <ExperienceFormContent experienceId={isNew ? null : params.id} />
    </ToastProvider>
  );
}
