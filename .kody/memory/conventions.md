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

**JSDoc**: Use JSDoc for public utility functions with @param, @returns, @example tags (see `src/utils/url-shortener.ts`)

**Dependency Injection**: Services accept dependencies via constructor (see `src/services/discussions.ts:21`)

**Store Pattern**: In-memory stores use Map<string, T> with private fields; separate interface definitions from Payload collection configs (see `src/collections/certificates.ts`)

**Sanitization**: Security utilities export single-purpose functions; use Record types for lookup maps; prefer regex replacement with callbacks over manual loops (see `src/security/sanitizers.ts`)

**ESLint**: `@typescript-eslint/no-unused-vars` ignores args starting with `_`, caught errors matching `^(_|ignore)`, and destructured values matching `^_`
