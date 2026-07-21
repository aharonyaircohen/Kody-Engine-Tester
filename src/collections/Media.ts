/**
 * @ai-summary Payload-managed file/media storage. Upload is enabled; the only metadata field is alt text.
 * @ai-summary Read access is public. Ensure alt is required in your form to prevent accessibility issues.
 */
import type { CollectionConfig } from 'payload'

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
