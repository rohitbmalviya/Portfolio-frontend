'use client';

// ============================================================
//  Education create / edit form
//  Route: /admin/education/new  →  create
//         /admin/education/:id  →  edit
//
//  Deferred-upload flow:
//   Create → adminEducation.create → get id → reconcileSingleMedia
//   Update → adminEducation.update → reconcileSingleMedia
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminEducation } from '@/lib/admin-api';
import { reconcileSingleMedia } from '@/lib/media-save';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ImageUpload, type ImageValue } from '@/components/admin/image-upload';
import {
  AdminInput,
  AdminToggle,
  AdminButton,
  AdminCard,
  LoadingRows,
} from '@/components/admin/ui';
import { DatePicker } from '@/components/admin/date-picker';

// ── Form state ─────────────────────────────────────────────────
// `ongoing` is UI-only; serialises to endDate: null when true.
// `logoValue` holds the current ImageValue (existing or pending).

interface FormState {
  degree: string;
  school: string;
  detail: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
  order: number;
  logoValue: ImageValue | null;
}

const EMPTY_FORM: FormState = {
  degree: '',
  school: '',
  detail: '',
  startDate: '',
  endDate: '',
  ongoing: false,
  order: 0,
  logoValue: null,
};

function EducationFormContent({ educationId }: { educationId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!educationId);
  const [saving, setSaving] = useState(false);
  const isNew = !educationId;

  // Track the original mediaId so we can delete it if replaced/removed.
  const originalMediaIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!educationId) return;
    setLoading(true);
    adminEducation
      .get(educationId)
      .then((edu) => {
        const logoValue: ImageValue | null =
          edu.logoMediaId && edu.logo
            ? { mediaId: edu.logoMediaId, url: edu.logo }
            : null;
        originalMediaIdRef.current = edu.logoMediaId ?? null;
        setForm({
          degree: edu.degree,
          school: edu.school,
          detail: edu.detail ?? '',
          startDate: edu.startDate ? edu.startDate.slice(0, 10) : '',
          endDate: edu.endDate ? edu.endDate.slice(0, 10) : '',
          ongoing: edu.endDate === null,
          order: edu.order,
          logoValue,
        });
      })
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load education.'),
      )
      .finally(() => setLoading(false));
  }, [educationId, toastError]);

  useEffect(() => {
    if (educationId) return;
    adminEducation
      .list()
      .then((list) => {
        const maxOrder = list.length > 0 ? Math.max(...list.map((e) => e.order)) : -1;
        setForm((f) => ({ ...f, order: maxOrder + 1 }));
      })
      .catch(() => {});
  }, [educationId]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.degree.trim() || !form.school.trim()) {
      toastError('Degree and School are required.');
      return;
    }
    if (!form.startDate) {
      toastError('Start date is required.');
      return;
    }
    if (!form.ongoing && form.endDate && form.endDate < form.startDate) {
      toastError('End date cannot be before the start date.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        degree: form.degree.trim(),
        school: form.school.trim(),
        detail: form.detail.trim() || undefined,
        order: form.order,
        startDate: form.startDate,
        endDate: form.ongoing ? null : (form.endDate || null),
      };

      let ownerId: string;

      if (isNew) {
        const created = await adminEducation.create(payload);
        ownerId = created.id;
        const errors = await reconcileSingleMedia({
          value: form.logoValue,
          originalMediaId: null,
          ownerId,
          ownerType: 'education',
          usage: 'logo',
          category: 'Raw',
        });
        if (errors.length > 0) {
          toastError(`Education created, but logo upload failed: ${errors.join('; ')}`);
        } else {
          success('Education created.');
        }
        router.replace(`/admin/education/${created.id}`);
      } else {
        await adminEducation.update(educationId!, payload);
        ownerId = educationId!;
        const errors = await reconcileSingleMedia({
          value: form.logoValue,
          originalMediaId: originalMediaIdRef.current,
          ownerId,
          ownerType: 'education',
          usage: 'logo',
          category: 'Raw',
        });
        if (errors.length > 0) {
          toastError(`Saved, but logo update had issues: ${errors.join('; ')}`);
        } else {
          success('Education saved.');
        }
        // Refresh to get updated logo info.
        const refreshed = await adminEducation.get(educationId!);
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
      title={isNew ? 'New Education' : `Edit: ${form.degree || 'Education'}`}
      actions={
        <AdminButton loading={saving} onClick={handleSubmit} type="button">
          <Save size={14} aria-hidden="true" />
          {saving ? 'Saving…' : isNew ? 'Create education' : 'Save changes'}
        </AdminButton>
      }
    >
      <Link
        href="/admin/education"
        className="inline-flex items-center gap-1.5 text-[13px] mb-5 transition-colors hover:text-[var(--accent)]"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All education
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
        {/* Degree / School / Detail */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Education Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Degree *"
              value={form.degree}
              onChange={(e) => set('degree', e.target.value)}
              required
              autoFocus
              placeholder="e.g. B.E. in Computer Engineering"
            />
            <AdminInput
              label="School *"
              value={form.school}
              onChange={(e) => set('school', e.target.value)}
              required
              placeholder="e.g. Pune University"
            />
            <AdminInput
              label="Detail"
              value={form.detail}
              onChange={(e) => set('detail', e.target.value)}
              placeholder="CGPA 8.9 / 10 (optional)"
              className="sm:col-span-2"
            />
          </div>
          {/* Institution logo — deferred upload */}
          <div className="mt-4">
            <ImageUpload
              label="Institution logo (optional)"
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
              label="Ongoing (currently studying)"
              checked={form.ongoing}
              onChange={(v) => set('ongoing', v)}
            />
            {!form.ongoing && (
              <DatePicker
                label="End date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(v) => set('endDate', v)}
              />
            )}
          </div>
        </AdminCard>

        {/* Display Order */}
        <AdminCard>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Display Order
          </h2>
          <AdminInput
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) => set('order', Number(e.target.value))}
            hint="Lower number appears first in the list"
          />
        </AdminCard>

        <div className="flex justify-end">
          <AdminButton loading={saving} type="submit" disabled={saving}>
            <Save size={14} aria-hidden="true" />
            {saving ? 'Saving…' : isNew ? 'Create education' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </AdminShell>
  );
}

export default function AdminEducationEditPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';

  return (
    <ToastProvider>
      <EducationFormContent educationId={isNew ? null : params.id} />
    </ToastProvider>
  );
}
