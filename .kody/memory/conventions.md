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

**Collections**: Payload collections export both the config and associated TypeScript interfaces (e.g., `export const Certificates: CollectionConfig`, `export interface Certificate`). Use `CollectionSlug` type for relationTo fields. See `src/collections/certificates.ts`.

**Classes**: Use PascalCase class names for stores and services (e.g., `CertificatesStore`, `DiscussionService`). Dependency injection via constructor. See `src/collections/certificates.ts`, `src/services/discussions.ts`.

**Security**: Sanitization utilities in `src/security/sanitizers.ts` — `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` for input validation

**Learned 2026-04-04 (task: 403-260404-211531)**: Uses vitest for testing

**Learned 2026-04-05 (task: 420-260405-054611)**: Active directories: src/app/api/health

**Learned 2026-04-05 (task: 444-260405-212643)**: Active directories: src/utils

**Learned 2026-04-05 (task: fix-pr-461-260405-214201)**: Uses eslint for linting
