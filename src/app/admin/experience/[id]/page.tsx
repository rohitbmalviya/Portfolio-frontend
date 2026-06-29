'use client';

// ============================================================
//  Experience create / edit form
//  Route: /admin/experience/new  →  create
//         /admin/experience/:id  →  edit
//
//  Deferred-upload flow:
//   Create → adminExperience.create → get id → reconcileSingleMedia
//   Update → adminExperience.update → reconcileSingleMedia
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminExperience } from '@/lib/admin-api';
import { reconcileSingleMedia } from '@/lib/media-save';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ImageUpload, type ImageValue } from '@/components/admin/image-upload';
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
// `present` is UI-only; serialises to endDate: null when true.
// `logoValue` holds the current ImageValue (existing or pending).

interface FormState {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  present: boolean;
  bullets: string[];
  order: number;
  logoValue: ImageValue | null;
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
  logoValue: null,
};

function ExperienceFormContent({ experienceId }: { experienceId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!experienceId);
  const [saving, setSaving] = useState(false);
  const isNew = !experienceId;

  // Track the original mediaId so we can delete it if replaced/removed.
  const originalMediaIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!experienceId) return;
    setLoading(true);
    adminExperience
      .get(experienceId)
      .then((exp) => {
        const logoValue: ImageValue | null =
          exp.logoMediaId && exp.logo
            ? { mediaId: exp.logoMediaId, url: exp.logo }
            : null;
        originalMediaIdRef.current = exp.logoMediaId ?? null;
        setForm({
          role: exp.role,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate ? exp.startDate.slice(0, 10) : '',
          endDate: exp.endDate ? exp.endDate.slice(0, 10) : '',
          present: exp.endDate === null,
          bullets: exp.bullets ?? [],
          order: exp.order,
          logoValue,
        });
      })
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load experience.'),
      )
      .finally(() => setLoading(false));
  }, [experienceId, toastError]);

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
        endDate: form.present ? null : (form.endDate || null),
      };

      let ownerId: string;

      if (isNew) {
        const created = await adminExperience.create(payload);
        ownerId = created.id;
        const errors = await reconcileSingleMedia({
          value: form.logoValue,
          originalMediaId: null,
          ownerId,
          ownerType: 'experience',
          usage: 'logo',
          category: 'Raw',
        });
        if (errors.length > 0) {
          toastError(`Experience created, but logo upload failed: ${errors.join('; ')}`);
        } else {
          success('Experience created.');
        }
        router.replace(`/admin/experience/${created.id}`);
      } else {
        await adminExperience.update(experienceId!, payload);
        ownerId = experienceId!;
        const errors = await reconcileSingleMedia({
          value: form.logoValue,
          originalMediaId: originalMediaIdRef.current,
          ownerId,
          ownerType: 'experience',
          usage: 'logo',
          category: 'Raw',
        });
        if (errors.length > 0) {
          toastError(`Saved, but logo update had issues: ${errors.join('; ')}`);
        } else {
          success('Experience saved.');
        }
        // Refresh to get updated logo info.
        const refreshed = await adminExperience.get(experienceId!);
        originalMediaIdRef.current = refreshed.logoMediaId ?? null;
        const logoValue: ImageValue | null =
          refreshed.logoMediaId && refreshed.logo
            ? { mediaId: refreshed.logoMediaId, url: refreshed.logo }
            : null;
        setForm((f) => ({ ...f, logoValue }));
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
          {saving ? 'Saving…' : isNew ? 'Create experience' : 'Save changes'}
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
          {/* Company logo — deferred upload */}
          <div className="mt-4">
            <ImageUpload
              label="Company logo (optional)"
              hint="Recommended: square PNG/SVG, min 80×80. Uploaded when you save."
              value={form.logoValue}
              onChange={(val) => set('logoValue', val)}
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
          <AdminButton loading={saving} type="submit" disabled={saving}>
            <Save size={14} aria-hidden="true" />
            {saving ? 'Saving…' : isNew ? 'Create experience' : 'Save changes'}
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
