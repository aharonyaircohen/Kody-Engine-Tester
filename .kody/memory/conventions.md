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

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components

## Learned 2026-04-04 (task: 403-260404-211531)
- Uses vitest for testing
- Uses eslint for linting

## Learned 2026-04-05 (task: 420-260405-054611)
- Uses vitest for testing
- Uses eslint for linting
- Active directories: src/app/api/health

## Learned 2026-04-05 (task: 444-260405-212643)
- Uses vitest for testing
- Uses eslint for linting
- Active directories: src/utils

## Learned 2026-04-05 (task: fix-pr-461-260405-214201)
- Uses vitest for testing
- Uses eslint for linting

## Learned 2026-04-10 (task: 1529-260410-102822)
- Uses Payload CMS collections

## Learned 2026-04-11 (task: 2009-retest)
- CSS Modules: import styles from `.module.css` files (e.g., `src/components/course-editor/ModuleList.tsx`)
- Constants: UPPER_CASE for module-level constants (e.g., `HTML_ENTITIES` in `src/security/sanitizers.ts:1`)
- Security utilities: dedicated `src/security/` directory for sanitizers (sanitizeHtml, sanitizeSql, sanitizeUrl)
- Service classes: dependency injection via constructor (e.g., `DiscussionService` in `src/services/discussions.ts`)
- Store classes: class-based data stores with private Map fields (e.g., `CertificatesStore` in `src/collections/certificates.ts`)
- Recursive patterns: tree traversal functions (e.g., `getThreadDepth` in `src/services/discussions.ts`)
- Interface suffixes: `Options`, `Result`, `Input` for option/result types (e.g., `UrlShortenerOptions`, `ShortCodeResult`)
- JSDoc: `@example` and `@param` tags for utility functions (see `src/utils/url-shortener.ts`)
- ProtectedRoute: wrapper component for auth-protected pages (see `src/pages/auth/profile.tsx`)
## Learned 2026-04-11 (task: 2009-retest)
- Active directories: .kody/memory, .kody/steps, .kody
