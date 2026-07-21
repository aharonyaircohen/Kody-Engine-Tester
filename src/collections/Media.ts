import type { CollectionConfig } from 'payload'

/**
 * @ai-summary Minimal Payload upload collection for binary assets (images, files) served by the configured storage adapter.
 *
 * TRAP: `upload: true` requires a storage adapter (S3, Azure, GCS, etc.) to be configured in
 * `payload.config.ts` — without it, uploads will fail at runtime. The `alt` text field is the
 * only metadata; all other asset metadata (filename, size, MIME type) is managed by the adapter.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
