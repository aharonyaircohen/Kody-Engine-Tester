## Learned 2026-04-09 (task: conventions-update-260409)

- **CSS Modules**: Import styles as default from `.module.css` files; e.g., `import styles from './ModuleList.module.css'` (see `src/components/course-editor/ModuleList.tsx`)
- **Utility function exports**: Public utility functions use named exports; e.g., `export async function generateShortCode(...)` (see `src/utils/url-shortener.ts`)
- **Error handling in utilities**: Throw `Error` with descriptive messages for invalid input; do not use Result types (see `src/utils/url-shortener.ts:27`)
- **Collection config pattern**: Payload collections use `CollectionConfig` with fields array; relationship fields cast `relationTo` to `CollectionSlug` type (see `src/collections/certificates.ts`)
- **Service class pattern**: Services use constructor injection; e.g., `constructor(private store: DiscussionsStore, private enrollmentStore: EnrollmentStore, ...)` (see `src/services/discussions.ts`)
- **Security utilities**: Named exports for sanitizers; input validation returns empty string for invalid values (see `src/security/sanitizers.ts`)
- **Interface-first organization**: Define interfaces before the class that uses them (see `src/collections/certificates.ts` and `src/services/discussions.ts`)
