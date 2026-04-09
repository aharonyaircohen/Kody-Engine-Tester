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

**CSS Modules**: Use `*.module.css` files co-located with components; import as `styles from './Component.module.css'`

**Security Utilities**: Sanitizers in `src/security/sanitizers.ts` for HTML (`sanitizeHtml`), SQL (`sanitizeSql`), and URL (`sanitizeUrl`) inputs

**Service Layer**: Business logic in `src/services/` using class pattern with dependency injection (e.g., `DiscussionService` constructor takes store and checker dependencies)

**Payload Collections**: Define config in `src/collections/` using `CollectionConfig`; co-locate interfaces and store classes with collection config

**JSDoc**: Document utility functions with `@example` blocks and parameter descriptions

**TypeScript ESLint Rules**: `no-unused-vars` warn with `argsIgnorePattern: '^_'`, `varsIgnorePattern: '^_'`; `no-explicit-any`: warn; `ban-ts-comment`: warn

**Learned 2026-04-04 (task: 403-260404-211531)**

- Uses vitest for testing

**Learned 2026-04-05 (task: 420-260405-054611)**

- Active directories: src/app/api/health

**Learned 2026-04-05 (task: 444-260405-212643)**

- Active directories: src/utils

**Learned 2026-04-05 (task: fix-pr-461-260405-214201)**

**Learned 2026-04-09 (task: conventions-update)**

- Testing: vitest + playwright (E2E)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- Package manager: pnpm
- CMS: Payload CMS 3.80.0 with PostgreSQL
- Module system: ESM
- CSS modules pattern for component styles
- Security sanitizers for HTML/SQL/URL
- Service layer with dependency injection pattern
- Collection configs with co-located interfaces and stores
- JSDoc documentation for utility functions
