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

**Event Handlers**: Prefix with `handle*` (e.g., `handleDragStart`, `handleDrop`, `handleDragEnd`)

**Utilities**: JSDoc with `@example` for public functions; constants use UPPER_SNAKE_CASE (e.g., `BASE62_CHARS`, `HTML_ENTITIES`)

**Security**: Sanitizers in `src/security/` export named utility functions (e.g., `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`)

**Stores/Classes**: Private members use `private` keyword; dependency injection via constructor; `Map`-based in-memory stores for non-Payload data

**Collections**: Payload `CollectionConfig` with `timestamps: true`; relationship fields use `relationTo` with `as CollectionSlug` cast

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

## Learned 2026-04-18 (task: conventions-update)

- Event handlers: `handle*` prefix
- Utilities: JSDoc `@example`, UPPER_SNAKE_CASE constants
- Security: named sanitizers in `src/security/`
- Classes: `private` keyword, constructor DI, `Map` stores
- Collections: `CollectionConfig`, `as CollectionSlug` cast
