// ============================================================
//  Media buckets — the ONLY three Cloudinary subfolders /
//  Media categories. Single source of truth for the frontend.
//  Values MUST match the backend `MediaBucket` enum
//  (portfolio-backend/src/modules/media/media.constants.ts).
// ============================================================

/** Upload bucket passed to <ImageUpload category={...} />. */
export enum MediaCategory {
  Projects = 'projects',
  Blogs = 'blogs',
  Raw = 'raw',
}

/** Admin Media Library grouping order (display labels, capitalized). */
export const MEDIA_CATEGORY_LABELS = ['Projects', 'Blogs', 'Raw'] as const;
