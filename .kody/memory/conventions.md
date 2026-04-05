# LearnHub Coding Conventions

**Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug

**Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred

```typescript
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
```

**Exports**: Named exports for utilities/types/classes; default export for page components only

**Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks (see `src/pages/auth/profile.tsx:27`)

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components

**CSS Modules**: Import as camelCase alias: `import styles from './ModuleList.module.css'`

**Security**: Sanitization utilities in `src/security/sanitizers.ts` (sanitizeHtml, sanitizeSql, sanitizeUrl)

**Stores & Services**: In-memory stores (e.g., `CertificatesStore`, `DiscussionsStore`) in `src/collections/`; service classes with dependency injection in `src/services/`

**Payload Collections**: Use `as CollectionSlug` cast on relationTo fields; collection slugs are singular

**API Auth**: Pass Bearer token in Authorization header; retrieve from localStorage via `localStorage.getItem('auth_access_token')`
