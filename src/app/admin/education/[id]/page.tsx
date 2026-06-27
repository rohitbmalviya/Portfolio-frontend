'use client';

// ============================================================
//  Education create / edit form
//  Route: /admin/education/new  →  create
//         /admin/education/:id  →  edit
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { adminEducation } from '@/lib/admin-api';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ImageUpload } from '@/components/admin/image-upload';
import {
  AdminInput,
  AdminToggle,
  AdminButton,
  AdminCard,
  LoadingRows,
} from '@/components/admin/ui';
import { DatePicker } from '@/components/admin/date-picker';

// ── Form state ─────────────────────────────────────────────────
// `ongoing` is a UI-only flag; serialises to endDate: null when true.
// startDate / endDate are stored as YYYY-MM-DD strings (what <input type="date"> uses).

interface FormState {
  degree: string;
  school: string;
  detail: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
  order: number;
  logo: string;
}

const EMPTY_FORM: FormState = {
  degree: '',
  school: '',
  detail: '',
  startDate: '',
  endDate: '',
  ongoing: false,
  order: 0,
  logo: '',
};

function EducationFormContent({ educationId }: { educationId: string | null }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!educationId);
  const [saving, setSaving] = useState(false);
  const isNew = !educationId;

  // Load existing education entry by id
  useEffect(() => {
    if (!educationId) return;
    setLoading(true);
    adminEducation
      .get(educationId)
      .then((edu) => {
        setForm({
          degree: edu.degree,
          school: edu.school,
          detail: edu.detail ?? '',
          // API may return a full ISO datetime — slice to YYYY-MM-DD for the date input
          startDate: edu.startDate ? edu.startDate.slice(0, 10) : '',
          endDate: edu.endDate ? edu.endDate.slice(0, 10) : '',
          // endDate === null means "Ongoing / currently studying"
          ongoing: edu.endDate === null,
          order: edu.order,
          logo: edu.logo ?? '',
        });
      })
      .catch((err) =>
        toastError(err instanceof Error ? err.message : 'Failed to load education.'),
      )
      .finally(() => setLoading(false));
  }, [educationId, toastError]);

  // Prefill order for brand-new entry: max(existing) + 1
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
        // ongoing toggle → null; otherwise use the YYYY-MM-DD value (or null if empty)
        endDate: form.ongoing ? null : (form.endDate || null),
        logo: form.logo || null,
      };
      if (isNew) {
        const created = await adminEducation.create(payload);
        success('Education created.');
        router.replace(`/admin/education/${created.id}`);
      } else {
        await adminEducation.update(educationId!, payload);
        success('Education saved.');
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
          {isNew ? 'Create education' : 'Save changes'}
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
          {/* Institution logo — optional */}
          <div className="mt-4">
            <ImageUpload
              label="Institution logo (optional)"
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
          <AdminButton loading={saving} type="submit">
            <Save size={14} aria-hidden="true" />
            {isNew ? 'Create education' : 'Save changes'}
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
