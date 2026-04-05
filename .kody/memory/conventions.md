# LearnHub Coding Conventions

**Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug

**Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred

```typescript
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
```

**Exports**: Named exports for utilities/types; default export for page components only

**Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks (see `src/pages/auth/profile.tsx:27`)

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`; security utilities in `src/security/`

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components

## Learned 2026-04-04 (task: 403-260404-211531)

- Uses vitest for testing
- Uses eslint for linting

## Learned 2026-04-05

**Security**: Sanitization utilities in `src/security/sanitizers.ts` — `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`, path traversal prevention; always validate/sanitize user input before rendering or querying

**URL Shortener**: `src/utils/url-shortener.ts` — async `generateShortCode(url, options)` using SHA-256 base62 encoding; accepts optional `salt` for randomness; throws on empty URL

**Middleware Layer**: Auth via JWT httpOnly cookie → `auth-middleware.ts` → `role-guard.ts` (RBAC: admin/instructor/student); rate-limiter, csrf-middleware, request-logger in `src/middleware/`

**In-Memory Stores**: Map-based stores (CertificatesStore, DiscussionsStore, EnrollmentStore) use `Map<id, entity>` with sequence generators for IDs

**Discussion Threads**: Max 3 levels deep; use `getThreadDepth()` helper; replies sorted chronologically; top-level posts sorted pinned-first then by date

**Certificate Numbers**: Format `LH-{courseId}-{year}-{sequence}` — see `src/collections/certificates.ts:generateCertificateNumber()`
