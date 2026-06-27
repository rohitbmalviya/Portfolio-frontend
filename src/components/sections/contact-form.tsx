'use client';

// ============================================================
//  ContactForm — public contact form (rendered when the
//  section's `showForm` is on). For now it submits via a
//  prefilled mailto: (no backend). A real POST endpoint can
//  replace handleSubmit later.
// ============================================================

import { useState } from 'react';
import { Send } from 'lucide-react';

export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact — ${name || from || 'message'}`);
    const body = encodeURIComponent(
      `${message}\n\n— ${name}${from ? ` <${from}>` : ''}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-[10px] border text-[14px] outline-none transition-colors focus:border-[--accent]';
  const inputStyle = {
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  } as const;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[14px] border p-5 flex flex-col gap-3"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className={inputClass}
          style={inputStyle}
        />
        <input
          type="email"
          required
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="Your email"
          aria-label="Your email"
          className={inputClass}
          style={inputStyle}
        />
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message…"
        aria-label="Your message"
        rows={4}
        className={`${inputClass} resize-y`}
        style={inputStyle}
      />
      <button
        type="submit"
        className="self-start inline-flex items-center gap-2 px-4 h-10 rounded-[10px] border font-semibold text-[14px] transition-all duration-200 hover:shadow-[0_0_24px_var(--accent-glow)]"
        style={{
          backgroundColor: 'var(--accent-dim)',
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
        }}
      >
        <Send size={15} aria-hidden="true" />
        Send message
      </button>
    </form>
  );
}
