'use client';

// ============================================================
//  DatePicker — themed date field for the admin
//  Drop-in replacement for <AdminInput type="date" …>
//  value / onChange / min all use YYYY-MM-DD strings
// ============================================================

import { useEffect, useId, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import RDP's base layout stylesheet; we fully override the colour tokens
// with CSS custom properties via the inline `style` prop on <DayPicker>.
import 'react-day-picker/style.css';

// ── Props ─────────────────────────────────────────────────────

export interface DatePickerProps {
  label?: string;
  value: string;               // YYYY-MM-DD, or '' when empty
  onChange: (v: string) => void;
  min?: string;                // YYYY-MM-DD — days before this are disabled
  required?: boolean;
  placeholder?: string;
}

// ── Helpers (local-date, no timezone drift) ───────────────────

/** Parse a YYYY-MM-DD string into a local Date (avoids UTC-midnight drift). */
function parseLocalDate(str: string | undefined): Date | undefined {
  if (!str) return undefined;
  const parts = str.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return undefined;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

/** Format a local Date back to YYYY-MM-DD. */
function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Human-readable display: "Jun 15, 2024". */
function formatDisplay(str: string): string {
  const date = parseLocalDate(str);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────

export function DatePicker({
  label,
  value,
  onChange,
  min,
  required,
  placeholder = 'Pick a date…',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date | undefined>(undefined);
  const genId = useId();
  const btnId = `dp-btn-${genId}`;
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseLocalDate(value);
  const minDate = parseLocalDate(min);

  // ── Close popover on outside-click or Escape ───────────────
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        // Return focus to the trigger button
        document.getElementById(btnId)?.focus();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, { capture: true });
    };
  }, [open, btnId]);

  // ── Toggle popover, initialising displayed month each time ─
  function toggle() {
    if (!open) {
      // Show selected month, or the min month if it's in the future, else today
      const today = new Date();
      if (selectedDate) {
        setDisplayMonth(selectedDate);
      } else if (minDate && minDate > today) {
        setDisplayMonth(minDate);
      } else {
        setDisplayMonth(today);
      }
    }
    setOpen((v) => !v);
  }

  // ── RDP single-select handler ──────────────────────────────
  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(toYmd(date));
      setOpen(false);
      document.getElementById(btnId)?.focus();
    }
  }

  // ── Disabled matcher (days before `min`) ───────────────────
  const disabledMatcher = minDate ? { before: minDate } : undefined;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={btnId}
          className="text-[13px] font-medium"
          style={{ color: 'var(--text)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* ── Trigger button — styled identically to AdminInput ── */}
        <button
          type="button"
          id={btnId}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-required={required}
          aria-label={
            label
              ? `${label}: ${value ? formatDisplay(value) : 'no date selected'}`
              : `Date: ${value ? formatDisplay(value) : 'no date selected'}`
          }
          onClick={toggle}
          className={cn(
            'w-full flex items-center justify-between gap-2',
            'px-3 py-2.5 rounded-[10px] border text-[14px]',
            'transition-colors duration-150 cursor-pointer text-left',
            'focus-visible:outline-none',
          )}
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: open ? 'var(--accent)' : 'var(--border)',
            color: value ? 'var(--text)' : 'var(--muted)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onBlur={(e) => {
            if (!open) e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <span className="truncate leading-none">
            {value ? formatDisplay(value) : placeholder}
          </span>
          <Calendar
            size={15}
            aria-hidden="true"
            className="shrink-0"
            style={{ color: 'var(--muted)' }}
          />
        </button>

        {/* ── Popover calendar ─────────────────────────────────── */}
        {open && (
          <div
            role="dialog"
            aria-label="Calendar date picker"
            aria-modal="false"
            className="dp-popover absolute left-0 top-full mt-1.5 z-50 rounded-[12px] border p-3"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
              minWidth: 'max-content',
            }}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              disabled={disabledMatcher}
              // Override every RDP CSS token with the app's design tokens.
              // These variables cascade to all .rdp-* child elements.
              style={
                {
                  // Accent = cyan from --accent token
                  '--rdp-accent-color': 'var(--accent)',
                  '--rdp-accent-background-color': 'var(--accent-dim)',
                  // Day cell sizing — tighter than RDP's 44 px default
                  '--rdp-day-height': '36px',
                  '--rdp-day-width': '36px',
                  '--rdp-day_button-height': '34px',
                  '--rdp-day_button-width': '34px',
                  '--rdp-day_button-border-radius': '8px',
                  '--rdp-day_button-border': '2px solid transparent',
                  // Today highlight
                  '--rdp-today-color': 'var(--accent)',
                  // Muted states
                  '--rdp-outside-opacity': '0.35',
                  '--rdp-disabled-opacity': '0.3',
                  '--rdp-weekday-opacity': '1',
                  // Nav button sizing
                  '--rdp-nav_button-height': '2rem',
                  '--rdp-nav_button-width': '2rem',
                  '--rdp-nav-height': '2.5rem',
                  // Selected border
                  '--rdp-selected-border': '2px solid var(--accent)',
                  // Inherit the app text colour
                  color: 'var(--text)',
                  fontSize: '13px',
                } as React.CSSProperties
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
