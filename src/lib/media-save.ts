// ============================================================
//  lib/media-save.ts — deferred-upload reconcile helpers.
//
//  Call these AFTER the entity has been created/updated so
//  that ownerId is known and the backend can link the media
//  records automatically.
//
//  Both functions swallow per-item errors and return an array
//  of error messages. The caller is responsible for surfacing
//  them (e.g. via a warning toast) without blocking the save.
// ============================================================

import { uploadMedia, deleteMedia, patchMedia } from './admin-api';
import type { MediaOwnerType } from './admin-api';
import type { ImageValue } from '@/components/admin/image-upload';

export type { MediaOwnerType };

// ── reconcileMultiMedia ────────────────────────────────────────

interface ReconcileMultiArgs {
  /** Current form values (existing + pending). */
  values: ImageValue[];
  /** mediaIds present when the form was loaded (before any edits). */
  originalMediaIds: string[];
  ownerId: string;
  ownerType: MediaOwnerType;
  /** Media usage label stored on every uploaded record (e.g. 'image', 'gallery'). */
  usage: string;
  /** Cloudinary category bucket ('Projects' | 'Blogs' | 'Raw'). */
  category?: string;
  /** Cloudinary folder slug — required for Projects / Blogs. */
  entitySlug?: string;
}

/**
 * Reconcile a multi-image field (project screenshots, blog images).
 *
 * 1. Deletes media records that were removed from the list.
 * 2. Uploads pending files (new picks) with the owner linked.
 * 3. Patches `order` for existing items so their position is preserved.
 *
 * Returns an array of human-readable error strings (empty = all good).
 */
export async function reconcileMultiMedia({
  values,
  originalMediaIds,
  ownerId,
  ownerType,
  usage,
  category,
  entitySlug,
}: ReconcileMultiArgs): Promise<string[]> {
  const errors: string[] = [];

  // 1. Delete removed media records.
  const removed = originalMediaIds.filter(
    (id) => !values.some((v) => 'mediaId' in v && v.mediaId === id),
  );
  await Promise.allSettled(
    removed.map((id) =>
      deleteMedia(id).catch((err) => {
        errors.push(`Delete ${id}: ${err instanceof Error ? err.message : 'failed'}`);
      }),
    ),
  );

  // 2. Upload pending files / patch order for existing items.
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    try {
      if ('file' in v) {
        // Pending — upload and link to the entity.
        await uploadMedia(v.file, {
          category,
          entitySlug,
          ownerId,
          ownerType,
          usage,
          order: i,
          alt: v.alt,
        });
      } else {
        // Existing — update order in case it changed.
        await patchMedia(v.mediaId, { order: i, alt: v.alt });
      }
    } catch (err) {
      errors.push(
        `Image ${i + 1}: ${err instanceof Error ? err.message : 'upload failed'}`,
      );
    }
  }

  return errors;
}

// ── reconcileSingleMedia ──────────────────────────────────────

interface ReconcileSingleArgs {
  /** Current form value (null = removed / never set). */
  value: ImageValue | null;
  /** mediaId that was loaded when the form was opened (null = was empty). */
  originalMediaId: string | null;
  ownerId: string;
  ownerType: MediaOwnerType;
  /** Usage label stored on the Media record (e.g. 'logo', 'og', 'resume', 'image'). */
  usage: string;
  category?: string;
  entitySlug?: string;
}

/**
 * Reconcile a single-image field (logo, award image, OG image, résumé).
 *
 * - If the original media was removed or replaced → deletes it.
 * - If there is a pending file → uploads it and links to the entity.
 *
 * Returns an array of human-readable error strings (empty = all good).
 */
export async function reconcileSingleMedia({
  value,
  originalMediaId,
  ownerId,
  ownerType,
  usage,
  category,
  entitySlug,
}: ReconcileSingleArgs): Promise<string[]> {
  const errors: string[] = [];

  const currentMediaId =
    value !== null && 'mediaId' in value ? value.mediaId : null;
  const isPending = value !== null && 'file' in value;

  // Delete original if it was removed or replaced with a different one.
  if (originalMediaId && originalMediaId !== currentMediaId) {
    try {
      await deleteMedia(originalMediaId);
    } catch (err) {
      errors.push(
        `Delete previous media: ${err instanceof Error ? err.message : 'failed'}`,
      );
    }
  }

  // Upload the pending file and link it.
  if (isPending && value && 'file' in value) {
    try {
      await uploadMedia(value.file, {
        ownerId,
        ownerType,
        usage,
        category,
        entitySlug,
        alt: value.alt,
      });
    } catch (err) {
      errors.push(
        `Upload: ${err instanceof Error ? err.message : 'upload failed'}`,
      );
    }
  }

  return errors;
}
