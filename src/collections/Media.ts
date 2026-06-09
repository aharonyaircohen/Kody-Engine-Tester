import type { CollectionConfig } from 'payload'

/**
 * @ai-summary
 * Central Payload file upload collection. `upload: true` enables the file upload UI.
 * Public read access — files are served to unauthenticated users.
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
