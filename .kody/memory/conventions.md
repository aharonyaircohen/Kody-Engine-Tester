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

## Learned 2026-04-08 (task: 832-260408-123712)
- Uses Drizzle ORM

## Learned 2026-04-09 (task: 841-260409-105040)
- Active directories: .kody/graph, .kody/graph/episodes

## Learned 2026-04-09 (task: 840-260409-110822)
- Active directories: .kody/graph/episodes, .kody/graph

## Learned 2026-04-09 (task: 842-260409-112718)
- Active directories: node_modules/@kody-ade/engine/dist, node_modules/@kody-ade/engine/dist/stages, node_modules/@kody-ade/engine

## Learned 2026-04-09 (task: 419-260405-054539)
- Uses Payload CMS collections
- Active directories: src/auth, src/middleware, src/collections, src/api/auth

## Learned 2026-04-09 (task: 846-260409-173335)
- Active directories: src/utils, .kody/graph, .kody/graph/episodes

## Learned 2026-04-09 (task: 863-260409-174540)
- Active directories: .kody/graph/episodes, .kody/graph, src/utils
