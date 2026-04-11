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

- Uses Drizzle ORM
- Uses Payload CMS collections

## Service Layer Pattern (src/services/discussions.ts)

Services use constructor dependency injection; return typed interfaces; private stores prefixed with `store`

```typescript
export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<User | undefined>,
    private enrollmentChecker: EnrollmentChecker,
  ) {}
}
```

## Store Pattern (src/collections/certificates.ts)

In-memory stores use `private Map` with interface definitions alongside collection configs

```typescript
export class CertificatesStore {
  private certificates: Map<string, Certificate> = new Map()
  private certificateNumbers: Map<string, string> = new Map()
}
```

## Security Utilities (src/security/sanitizers.ts)

Named export functions for sanitization; return empty string for invalid input; validate before processing

```typescript
export function sanitizeHtml(input: string): string { ... }
export function sanitizeSql(input: string): string { ... }
export function sanitizeUrl(input: string): string { ... }
```

## Utility Function Patterns (src/utils/url-shortener.ts)

Async functions with options objects; JSDoc with @example tags; throw on invalid input

```typescript
export async function generateShortCode(
  url: string,
  options: UrlShortenerOptions = {}
): Promise<ShortCodeResult> {
  if (!url) throw new Error('URL is required')
  ...
}
```
