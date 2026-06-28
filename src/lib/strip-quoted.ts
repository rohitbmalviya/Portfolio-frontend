// ============================================================
//  lib/strip-quoted.ts — Splits an email body into the new/
//  visible text and the quoted reply history.
//
//  Used by the admin Messages inbox to display only the new
//  content in each chat bubble, with the quoted block tucked
//  behind a collapsible "Show quoted text" toggle.
// ============================================================

/** Return type of splitQuoted. */
export interface SplitResult {
  /** The new/visible portion of the message body. */
  visible: string;
  /**
   * The quoted reply history, if a quote marker was detected.
   * Empty string when no quote was found.
   */
  quoted: string;
}

/**
 * splitQuoted — conservative, best-effort detection of email quote markers.
 *
 * The function scans lines in order and takes the EARLIEST match from the
 * following heuristics:
 *
 * 1. **"On … wrote:" attribution header** (Gmail / Apple Mail / most MUAs)
 *    A line that starts with "On " and whose own text — or the immediately
 *    following line's text — ends with "wrote:".
 *    Covers both single-line and two-line wrapped variants:
 *      • "On Sun, 28 Jun 2026, 1:00 pm Foo <foo@example.com> wrote:"
 *      • "On Sun, 28 Jun 2026 at 13:00, Foo <foo@example.com>\nwrote:"
 *
 * 2. **Chevron-quoted block** — the first line whose trimmed content starts
 *    with ">" (the standard RFC 3676 quoting character). Even a single ">"
 *    line is treated as the start of the quoted section.
 *
 * 3. **Plain-text separator lines** (Outlook / Exchange):
 *    - Exactly "-----Original Message-----"
 *    - Exactly "________________________________" (long underscore bar)
 *
 * Handles both \r\n (Windows) and \n (Unix) line endings.
 *
 * **Edge-case guard** — whole body is a quote: if the split leaves `visible`
 * empty (the very first line already matches a quote marker), we return
 * `{ visible: body.trim(), quoted: '' }` so the bubble is never blank.
 */
export function splitQuoted(body: string): SplitResult {
  // Normalise Windows (\r\n) and old Mac (\r) line endings to Unix (\n).
  const normalised = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalised.split('\n');

  // Index of the first line that belongs to the quoted block; -1 = not found.
  let splitAt = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // ── Heuristic 3: exact separator lines ──────────────────────────────
    if (
      trimmed === '-----Original Message-----' ||
      trimmed === '________________________________'
    ) {
      splitAt = i;
      break;
    }

    // ── Heuristic 2: chevron-quoted lines ───────────────────────────────
    if (trimmed.startsWith('>')) {
      splitAt = i;
      break;
    }

    // ── Heuristic 1: "On … wrote:" attribution header ───────────────────
    // The header may be contained on a single line, or it may wrap so that
    // the current line starts with "On " and the *next* line ends "wrote:".
    if (trimmed.startsWith('On ')) {
      if (trimmed.endsWith('wrote:')) {
        // Single-line form — whole header fits on one line.
        splitAt = i;
        break;
      }
      // Two-line wrapped form — check whether the very next line closes it.
      if (i + 1 < lines.length && lines[i + 1].trim().endsWith('wrote:')) {
        splitAt = i;
        break;
      }
    }
  }

  // ── No quote marker found ────────────────────────────────────────────
  if (splitAt === -1) {
    return { visible: normalised.trim(), quoted: '' };
  }

  const visible = lines.slice(0, splitAt).join('\n').trim();
  const quoted = lines.slice(splitAt).join('\n').trim();

  // ── Edge-case guard: entire body was a quote ─────────────────────────
  // Returning an empty bubble would be confusing; show the full text instead.
  if (!visible) {
    return { visible: normalised.trim(), quoted: '' };
  }

  return { visible, quoted };
}
