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

**Security Utilities** (`src/security/sanitizers.ts`): Sanitization functions follow camelCase naming. HTML stripping via regex, SQL escaping with backslash replacement, URL validation rejecting `javascript:`/`data:` protocols.

```typescript
export function sanitizeHtml(input: string): string
export function sanitizeSql(input: string): string
export function sanitizeUrl(input: string): string
```

**Service Classes** (`src/services/discussions.ts`): Constructor-based dependency injection. Private readonly store dependencies. Helper functions at module level above class definition.

```typescript
export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<User | undefined>,
    private enrollmentChecker: EnrollmentChecker,
  ) {}
```

**Collection Stores** (`src/collections/certificates.ts`): In-memory stores use `Map<string, T>` with private fields. Type interfaces defined alongside collection config. Sequential ID generation patterns for certificate numbers.

```typescript
export class CertificatesStore {
  private certificates: Map<string, Certificate> = new Map()
  private certificateNumbers: Map<string, string> = new Map()
```

**Utility Functions** (`src/utils/url-shortener.ts`): Async crypto operations via `crypto.subtle.digest`. Options interface for optional parameters with defaults. Full JSDoc with @example tags.

```typescript
export async function generateShortCode(
  url: string,
  options: UrlShortenerOptions = {},
): Promise<ShortCodeResult>
```

**Type Casting**: Collections use `as CollectionSlug` for Payload relation fields (see `src/collections/certificates.ts`)

**JSDoc**: Document public utility functions with description, @param, @returns, and @example blocks

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
