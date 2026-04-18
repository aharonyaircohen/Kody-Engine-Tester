### Learned 2026-04-18 (task: conventions update)

- CSS modules: `import styles from './ModuleList.module.css'`
- Service classes: `constructor(private store: DiscussionsStore, ...)` with dependency injection
- JSDoc comments with `@example` in utility files
- `CollectionConfig`, `CollectionSlug` from Payload; collection slugs are singular (`'certificates'`)
- Sanitizers in `src/security/sanitizers.ts` with HTML entity decoding map
- ProtectedRoute wrapper pattern for page-level auth
- Bearer token auth: `Authorization: \`Bearer ${accessToken}\``
- Collections export both `CollectionConfig` and interfaces (`export interface Certificate`)
