import type { CollectionConfig } from 'payload'

/**
 * @ai-summary
 * Payload-upload collection for file assets (images, documents) accessible to all users.
 *
 * **Trap:** `access.read: () => true` makes all uploaded media publicly accessible, even
 * to unauthenticated users. Do not store sensitive files here.
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
