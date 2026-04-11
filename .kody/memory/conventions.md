## Learned 2026-04-11 (task: SDLC pipeline conventions)

- Class-based services with constructor dependency injection (e.g., `DiscussionService`, `CertificatesStore`)
- Getter-based private data access pattern (`private store: DiscussionsStore`)
- Security utilities in `src/security/sanitizers.ts` for HTML/SQL/URL sanitization
- Payload CMS collection configs co-locate interfaces (e.g., `Certificate`, `Enrollment`) with collection definition
- Async utility functions with JSDoc documentation in `src/utils/`
- Drag-and-drop state managed with `useState<string | null>` for `draggingId`/`dragOverId`
- Auth tokens stored in `localStorage` with `Bearer` header pattern for API calls
- PATCH method for partial updates (profile password change in `src/pages/auth/profile.tsx`)
- `'use client'` on all React component files; interfaces defined inline or alongside components
