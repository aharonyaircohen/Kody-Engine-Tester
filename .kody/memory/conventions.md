## Learned 2026-04-07 (task: conventions-update-260407)

- CSS modules use `.module.css` naming (see `ModuleList.module.css`)
- Security utilities in `src/security/sanitizers.ts` (sanitizeHtml, sanitizeSql, sanitizeUrl)
- Services layer in `src/services/` for business logic (discussions.ts)
- Collections can export both config and TypeScript interfaces (see `src/collections/certificates.ts`)
- Stores use private class fields (`private certificates: Map<>`) with `Map` for in-memory data
- `'use client'` directive required on all React client components
- Named exports for utilities, types, stores, and services; default export only for page components
- `import type` used for Payload types to avoid bundling runtime dependencies
- Context usage: `useContext(AuthContext)` with named import from context file
- fetch with `Authorization: Bearer` header pattern for authenticated API calls
- Error silencing with empty `.catch(() => {})` for non-critical fallback behavior
