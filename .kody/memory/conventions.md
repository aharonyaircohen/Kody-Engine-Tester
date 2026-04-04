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

## Learned 2026-04-04 (task: 395-260404-211456)
- Uses vitest for testing
- Uses eslint for linting
- Active directories: src/auth, src/collections, src/middleware, src/app/api/courses/search, src/app/api/enroll, src/app/api/dashboard/admin-stats, src/app/api/gradebook, src/app/api/gradebook/course/[id], src/app/api/notes, src/app/api/notes/[id], src/app/api/notifications, src/app/api/notifications/read-all, src/app/api/notifications/[id]/read, src/app/api/quizzes/[id], src/app/api/quizzes/[id]/attempts, src/app/api/quizzes/[id]/submit
