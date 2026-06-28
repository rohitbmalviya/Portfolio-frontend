'use client';

// ============================================================
//  Admin Messages — two-pane inbox for contact form submissions
//  and Gmail-synced threads.
//
//  LEFT PANE  : thread list — name, email, snippet, relative
//               time, unread dot + bold.
//  RIGHT PANE : selected conversation — chat bubbles (inbound
//               left in --surface-2, outbound right in
//               --accent-dim), Gmail source badge, reply box,
//               delete + sync actions.
//
//  Header actions (in AdminShell):
//    - "Mark all read" ghost button (visible when ≥1 unread)
//    - "Compose" primary button (opens compose modal)
//    - "Sync now" ghost button
//
//  Hides source:'notification' messages per spec.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCheck,
  Inbox,
  MessageCircle,
  PenSquare,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { adminContact, type ContactThreadDetail } from '@/lib/admin-api';
import type { ContactMessage, ContactThread } from '@/lib/types';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider, useToast } from '@/components/admin/toast';
import {
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminTextarea,
  ConfirmDialog,
  LoadingRows,
  EmptyState,
} from '@/components/admin/ui';
import { cn } from '@/lib/utils';
import { splitQuoted } from '@/lib/strip-quoted';

// ── Helpers ───────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: days > 365 ? 'numeric' : undefined,
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── ComposeModal ──────────────────────────────────────────────

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (thread: ContactThreadDetail) => void;
}

function ComposeModal({ open, onClose, onSuccess }: ComposeModalProps) {
  const toast = useToast();
  const [to, setTo] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [toError, setToError] = useState('');
  const [bodyError, setBodyError] = useState('');
  const toRef = useRef<HTMLInputElement>(null);

  // Focus the "To" field when the modal opens, and reset state.
  useEffect(() => {
    if (open) {
      setTo('');
      setName('');
      setSubject('');
      setBody('');
      setToError('');
      setBodyError('');
      setSending(false);
      // Defer focus so the element is visible in the DOM first.
      requestAnimationFrame(() => toRef.current?.focus());
    }
  }, [open]);

  // Close on Escape key.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !sending) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, sending, onClose]);

  async function handleSend() {
    let valid = true;

    if (!to.trim() || !EMAIL_RE.test(to.trim())) {
      setToError('Please enter a valid email address.');
      valid = false;
    } else {
      setToError('');
    }

    if (!body.trim()) {
      setBodyError('Message body is required.');
      valid = false;
    } else {
      setBodyError('');
    }

    if (!valid) return;

    setSending(true);
    try {
      const thread = await adminContact.compose({
        to: to.trim(),
        name: name.trim() || undefined,
        subject: subject.trim() || undefined,
        body: body.trim(),
      });
      toast.success('Message sent.');
      onSuccess(thread);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to send message.',
      );
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={() => { if (!sending) onClose(); }}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div
        className="relative z-10 w-full max-w-[520px] rounded-[16px] border flex flex-col gap-0"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2
            id="compose-title"
            className="text-[16px] font-semibold"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}
          >
            New message
          </h2>
          <button
            type="button"
            onClick={() => { if (!sending) onClose(); }}
            aria-label="Close compose modal"
            disabled={sending}
            className="w-8 h-8 rounded-[8px] border grid place-items-center transition-colors duration-150 hover:border-[var(--muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <AdminInput
            ref={toRef}
            label="To *"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            error={toError}
            disabled={sending}
            autoComplete="email"
          />
          <AdminInput
            label="Name (optional)"
            placeholder="Recipient name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={sending}
            autoComplete="name"
          />
          <AdminInput
            label="Subject (optional)"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
          />
          <AdminTextarea
            label="Message *"
            placeholder="Write your message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            error={bodyError}
            rows={5}
            disabled={sending}
          />
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-end gap-2 px-6 pb-5 pt-2 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <AdminButton
            variant="ghost"
            onClick={() => { if (!sending) onClose(); }}
            disabled={sending}
          >
            <X size={13} aria-hidden="true" />
            Cancel
          </AdminButton>
          <AdminButton loading={sending} onClick={handleSend}>
            <Send size={13} aria-hidden="true" />
            Send message
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────

function MessageBubble({ message }: { message: ContactMessage }) {
  const isOutbound = message.direction === 'outbound';

  // Split the body into the new visible text and any quoted reply history.
  // For messages with no quote markers, quoted will be '' and the toggle
  // will not render — so this is safe to apply to every message.
  const { visible, quoted } = splitQuoted(message.body);

  // Local toggle state — tracks whether the quoted block is expanded.
  const [showQuoted, setShowQuoted] = useState(false);

  return (
    <div className={cn('flex', isOutbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] flex flex-col gap-1',
          isOutbound ? 'items-end' : 'items-start',
        )}
      >
        {/* Bubble */}
        <div
          className="px-4 py-2.5 text-[13px] leading-relaxed break-words"
          style={{
            backgroundColor: isOutbound
              ? 'var(--accent-dim)'
              : 'var(--surface-2)',
            color: 'var(--text)',
            borderRadius: isOutbound
              ? '12px 12px 4px 12px'
              : '12px 12px 12px 4px',
          }}
        >
          {/* Visible (new) portion of the message — preserve line breaks */}
          <span className="whitespace-pre-wrap">{visible}</span>

          {/* Quoted text toggle — only rendered when quoted history exists */}
          {quoted && (
            <>
              <button
                type="button"
                onClick={() => setShowQuoted((prev) => !prev)}
                className="mt-2 block text-[11px] underline underline-offset-2 cursor-pointer"
                style={{ color: 'var(--muted)' }}
                aria-expanded={showQuoted}
              >
                {showQuoted ? 'Hide quoted text' : 'Show quoted text'}
              </button>

              {showQuoted && (
                <pre
                  className="mt-2 text-[11px] font-mono whitespace-pre-wrap break-words border-t pt-2"
                  style={{
                    color: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }}
                  aria-label="Quoted reply history"
                >
                  {quoted}
                </pre>
              )}
            </>
          )}
        </div>

        {/* Meta row: timestamp + source badge */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            {new Date(message.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.source === 'gmail' && (
            <AdminBadge variant="accent">Gmail</AdminBadge>
          )}
          {message.source === 'app' && (
            <AdminBadge variant="muted">App</AdminBadge>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Thread list item ──────────────────────────────────────────

function ThreadItem({
  thread,
  selected,
  onClick,
}: {
  thread: ContactThread;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full text-left px-4 py-3 border-b transition-colors duration-150',
          selected
            ? 'bg-[var(--accent-dim)]'
            : 'hover:bg-[var(--surface-2)]',
        )}
        style={{ borderColor: 'var(--border)' }}
        role="option"
        aria-selected={selected}
      >
        {/* Row 1: name + time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {thread.unread && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
                aria-label="Unread"
              />
            )}
            <span
              className={cn('text-[13px] truncate', thread.unread && 'font-semibold')}
              style={{ color: 'var(--text)' }}
            >
              {thread.name}
            </span>
          </div>
          <span
            className="text-[11px] shrink-0"
            style={{ color: 'var(--muted)' }}
          >
            {relativeTime(thread.lastMessageAt)}
          </span>
        </div>

        {/* Row 2: email */}
        <p className="text-[12px] truncate" style={{ color: 'var(--muted)' }}>
          {thread.email}
        </p>

        {/* Row 3: subject */}
        {thread.subject && (
          <p
            className="text-[12px] truncate font-medium mt-0.5"
            style={{ color: 'var(--muted)' }}
          >
            {thread.subject}
          </p>
        )}

        {/* Row 4: snippet */}
        {thread.lastSnippet && (
          <p
            className="text-[12px] line-clamp-2 mt-0.5"
            style={{ color: 'var(--muted)' }}
          >
            {thread.lastSnippet}
          </p>
        )}
      </button>
    </li>
  );
}

// ── Main content ──────────────────────────────────────────────

function MessagesContent() {
  const toast = useToast();

  // Thread list
  const [threads, setThreads] = useState<ContactThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  // Selected thread
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<ContactThreadDetail | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);

  // Reply
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<ContactThread | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sync
  const [syncing, setSyncing] = useState(false);

  // Compose modal
  const [composeOpen, setComposeOpen] = useState(false);

  // Auto-scroll to bottom of message list
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Data loaders ───────────────────────────────────────────

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const data = await adminContact.listThreads();
      // Sort newest-last-message first
      setThreads(
        [...data].sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime(),
        ),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load threads.',
      );
    } finally {
      setLoadingThreads(false);
    }
  }, [toast]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Scroll to bottom whenever the message list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.messages?.length]);

  // ── Select thread ──────────────────────────────────────────

  async function selectThread(thread: ContactThread) {
    if (selectedId === thread.id) return;
    setSelectedId(thread.id);
    setSelectedThread(null);
    setLoadingThread(true);
    setReplyBody('');
    try {
      const detail = await adminContact.getThread(thread.id);
      setSelectedThread(detail);
      // Mark as read and optimistically update the list
      if (thread.unread) {
        await adminContact.markRead(thread.id).catch(() => {
          // Non-fatal — the server state will sync on next load
        });
        setThreads((prev) =>
          prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t)),
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load conversation.',
      );
      setSelectedId(null);
    } finally {
      setLoadingThread(false);
    }
  }

  // ── Reply ──────────────────────────────────────────────────

  async function handleReply() {
    if (!selectedThread || !replyBody.trim()) return;
    setSending(true);
    const body = replyBody.trim();
    try {
      await adminContact.reply(selectedThread.id, body);
      setReplyBody('');
      // Re-fetch the thread to get the new message appended
      const detail = await adminContact.getThread(selectedThread.id);
      setSelectedThread(detail);
      toast.success('Reply sent.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to send reply.',
      );
    } finally {
      setSending(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminContact.remove(deleteTarget.id);
      setThreads((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) {
        setSelectedId(null);
        setSelectedThread(null);
      }
      setDeleteTarget(null);
      toast.success('Thread deleted.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete thread.',
      );
    } finally {
      setDeleting(false);
    }
  }

  // ── Sync ───────────────────────────────────────────────────

  async function handleSync() {
    setSyncing(true);
    try {
      await adminContact.sync();
      toast.success('Sync complete.');
      await loadThreads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }

  // ── Mark all read ──────────────────────────────────────────

  async function handleReadAll() {
    try {
      await adminContact.readAll();
      toast.success('All messages marked as read.');
      // Optimistically clear every unread dot in the list.
      setThreads((prev) => prev.map((t) => ({ ...t, unread: false })));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to mark all as read.',
      );
    }
  }

  // ── Compose success handler ────────────────────────────────

  async function handleComposeSuccess(newThread: ContactThreadDetail) {
    setComposeOpen(false);
    // Refresh the thread list so the new thread appears.
    await loadThreads();
    // Select the newly created thread directly using the returned data.
    setSelectedId(newThread.id);
    setSelectedThread(newThread);
  }

  // ── Derived values ─────────────────────────────────────────

  // Filter out notification-source messages — they are system records,
  // not human messages and should not appear in the chat view.
  const visibleMessages = (selectedThread?.messages ?? []).filter(
    (m) => m.source !== 'notification',
  );

  const hasUnread = threads.some((t) => t.unread);

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      <AdminShell
        title="Messages"
        description="Contact form submissions and email threads."
        actions={
          <>
            {hasUnread && (
              <AdminButton variant="ghost" onClick={handleReadAll}>
                <CheckCheck size={14} aria-hidden="true" />
                Mark all read
              </AdminButton>
            )}
            <AdminButton onClick={() => setComposeOpen(true)}>
              <PenSquare size={14} aria-hidden="true" />
              Compose
            </AdminButton>
            <AdminButton variant="ghost" onClick={handleSync} loading={syncing}>
              <RefreshCw size={14} aria-hidden="true" />
              Sync now
            </AdminButton>
          </>
        }
      >
        {/* Two-pane layout */}
        <div
          className="flex border rounded-[12px] overflow-hidden"
          style={{
            borderColor: 'var(--border)',
            height: 'calc(100vh - 156px)',
            minHeight: '400px',
          }}
        >
          {/* ── LEFT: Thread list ─────────────────────────────── */}
          <div
            className="w-[300px] shrink-0 flex flex-col border-r"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            {/* List header */}
            <div
              className="px-4 py-3 border-b text-[11px] font-semibold uppercase tracking-widest shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Inbox {!loadingThreads && `(${threads.length})`}
            </div>

            {loadingThreads ? (
              <div className="p-4 flex-1">
                <LoadingRows rows={4} />
              </div>
            ) : threads.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<Inbox size={18} />}
                  title="No messages yet"
                  description="Contact form submissions will appear here."
                />
              </div>
            ) : (
              <ul
                className="overflow-y-auto flex-1"
                role="listbox"
                aria-label="Message threads"
                aria-multiselectable="false"
              >
                {threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    selected={selectedId === thread.id}
                    onClick={() => selectThread(thread)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* ── RIGHT: Conversation ───────────────────────────── */}
          <div
            className="flex-1 min-w-0 flex flex-col"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            {!selectedId && !loadingThread ? (
              /* Empty state — no thread selected */
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<MessageCircle size={20} />}
                  title="Select a conversation"
                  description="Choose a thread from the left to view messages."
                />
              </div>
            ) : loadingThread ? (
              /* Loading thread */
              <div className="flex-1 p-6">
                <LoadingRows rows={5} />
              </div>
            ) : selectedThread ? (
              <>
                {/* Thread header */}
                <div
                  className="flex items-center justify-between gap-3 px-5 py-3 border-b shrink-0"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <div className="min-w-0">
                    <h2
                      className="text-[14px] font-semibold truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {selectedThread.subject ??
                        `Message from ${selectedThread.name}`}
                    </h2>
                    <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
                      {selectedThread.name}&nbsp;&middot;&nbsp;{selectedThread.email}
                      {selectedThread.messageCount != null &&
                        ` · ${selectedThread.messageCount} message${selectedThread.messageCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(selectedThread)}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Delete
                  </AdminButton>
                </div>

                {/* Message bubbles */}
                <div
                  className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
                  role="log"
                  aria-label="Conversation"
                  aria-live="polite"
                >
                  {visibleMessages.length === 0 ? (
                    <p
                      className="text-[13px] text-center mt-12"
                      style={{ color: 'var(--muted)' }}
                    >
                      No messages in this thread.
                    </p>
                  ) : (
                    visibleMessages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))
                  )}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>

                {/* Reply box */}
                <div
                  className="border-t p-4 flex flex-col gap-3 shrink-0"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <AdminTextarea
                    placeholder="Type your reply… (Ctrl+Enter to send)"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                    aria-label="Reply message"
                    disabled={sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <AdminButton
                      onClick={handleReply}
                      loading={sending}
                      disabled={!replyBody.trim() || sending}
                    >
                      <Send size={13} aria-hidden="true" />
                      Send reply
                    </AdminButton>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Delete confirm dialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete conversation"
          description={`Permanently delete the thread from "${deleteTarget?.name}"? This cannot be undone.`}
          confirmLabel="Delete thread"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      </AdminShell>

      {/* Compose modal — rendered outside AdminShell so z-index stacks correctly */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSuccess={handleComposeSuccess}
      />
    </>
  );
}

// ── Page export ───────────────────────────────────────────────

export default function AdminMessagesPage() {
  return (
    <ToastProvider>
      <MessagesContent />
    </ToastProvider>
  );
}
