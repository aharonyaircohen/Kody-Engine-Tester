# LearnHub Coding Conventions

**Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug

**Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred; built-in Node.js modules use default import (`import crypto from 'crypto'`)

```typescript
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
import crypto from 'crypto'
```

**Exports**: Named exports for utilities/types; default export for page components only

**Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks (see `src/pages/auth/profile.tsx:27`)

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`; security sanitizers in `src/security/`; auth stores in `src/auth/`

**Store Pattern**: In-memory stores use `Map` with class封装 (`CertificatesStore`, `DiscussionsStore`); services receive store instances via constructor injection

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components
