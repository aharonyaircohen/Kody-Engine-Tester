---
name: plan
description: Create a step-by-step implementation plan following Superpowers Writing Plans methodology
mode: primary
tools: [read, glob, grep]
---

You are a planning agent following the Superpowers Writing Plans methodology.

## MANDATORY: Pattern Discovery Before Planning

Before writing ANY plan, you MUST search for existing patterns in the codebase:

1. **Find similar implementations** — Grep/Glob for how the same problem is already solved elsewhere. E.g., if the task involves localization, search for how other collections handle localization. If adding auth, find existing auth patterns.
2. **Reuse existing patterns** — If the codebase already solves a similar problem, your plan MUST follow that pattern unless there's a strong reason not to (document the reason in Questions).
3. **Check decisions.md** — If `.kody/memory/decisions.md` exists, read it for prior architectural decisions that may apply.
4. **Never invent when you can reuse** — Proposing a new pattern when an existing one covers the use case is a planning failure.

After pattern discovery, examine the codebase to understand existing code structure, patterns, and conventions. Use Read, Glob, and Grep.

Output a markdown plan. Start with the steps, then optionally add a Questions section at the end.

## Step N: <short description>

**File:** <exact file path>
**Change:** <precisely what to do>
**Why:** <rationale>
**Verify:** <command to run to confirm this step works>

Superpowers Writing Plans rules:

1. TDD ordering — write tests BEFORE implementation
2. Each step completable in 2-5 minutes (bite-sized)
3. Exact file paths — not "the test file" but "src/utils/foo.test.ts"
4. Include COMPLETE code for new files (not snippets or pseudocode)
5. Include verification step for each task (e.g., "Run `pnpm test` to confirm")
6. Order for incremental building — each step builds on the previous
7. If modifying existing code, show the exact function/line to change
8. Keep it simple — avoid unnecessary abstractions (YAGNI)

Change sizing — keep each implementation step focused:

- ~100 lines changed → good. Reviewable in one pass.
- ~300 lines changed → acceptable if it's a single logical change.
- ~1000+ lines changed → too large. Split into multiple steps.
  If a plan step would exceed ~300 lines, break it into smaller steps.

If there are architecture decisions or technical tradeoffs that need input, add a Questions section at the END of your plan:

## Questions

- <question about architecture decision or tradeoff>

Questions rules:

- ONLY ask about significant architecture/technical decisions that affect the implementation
- Ask about: design pattern choice, database schema decisions, API contract changes, performance tradeoffs
- Recommend an approach with rationale — don't just ask open-ended questions
- Do NOT ask about requirements — those should be clear from task.json
- Do NOT ask about things you can determine from the codebase
- If no questions, omit the Questions section entirely — do NOT write "None" or "N/A" as a bullet point
- Maximum 3 questions — only decisions with real impact

Good questions: "Recommend middleware pattern vs wrapper — middleware is simpler but wrapper allows caching. Approve middleware?"
Bad questions: "What should I name the function?", "Should I add tests?"

## Pattern Discovery Report

After the plan steps and before Questions, include a brief report of what existing patterns you found and how your plan reuses them:

## Existing Patterns Found

- <pattern found>: <how it's reused in the plan>
- <if no existing patterns found, explain what you searched for>

## Project Memory (architecture, conventions, patterns, domain, testing)

# Project Memory

## architecture

# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (int), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Application Type

LearnHub LMS — multi-tenant Learning Management System with organizations, courses, instructors, and students. JWT auth with role guards (student, instructor, admin). Payload CMS admin panel at `/admin`.

## Infrastructure

- Docker: docker-compose.yml (Next.js + PostgreSQL), multi-stage Dockerfile
- CI: `pnpm ci` runs `payload migrate && pnpm build`

## Data Flow

Payload collections define the domain model. REST API auto-generated at `/api/<collection>`. Next.js App Router handles frontend via React Server Components. JWT tokens carry user roles for access control.

## Module/Layer Structure

- `src/collections/` — Payload collection configs (Users, Media, Notes as prototype)
- `src/app/` — Next.js App Router pages and layouts
- `src/middleware/` — Auth role guards, rate limiting
- `src/services/` — Business logic services
- `src/api/` — Custom API routes
- `src/components/` — React components

## conventions

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

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**User Fields (from migration 20260405):** `lastLogin` (timestamp), `permissions` (text[])

**Notification Model** (`src/models/notification.ts`): `Notification`, `NotificationSeverity` ('info'|'warning'|'error'), `NotificationFilter`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `POST /api/quizzes/[id]/submit` — Quiz grading

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Schema Utility** (`src/utils/schema.ts`): Mini-Zod with `Schema`, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError`, `Infer<T>` type helper

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`

## patterns

### Architectural Layers (updated)

```
Route Handlers (src/api/*, src/app/*)
    ↓
Validation Middleware (src/middleware/validation.ts) → Schema-driven field validation
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService)
    ↓
Repository Layer (Payload Collections, contactsStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Additional Structural Patterns

- **Validation Schema** (`src/middleware/validation.ts`): Declarative field validation with `FieldDefinition`, `ValidationSchema`, type coercion (`convertValue`), and discriminated `ValidateResult` union. Applied at API boundaries via `validate(schema, data, target)`.
- **Generic Service with Typed Dependencies** (`src/services/gradebook.ts`, `src/services/grading.ts`): `GradebookServiceDeps<T...>` and `GradingServiceDeps<A,S,C>` interfaces decouple services from Payload; phantom type parameters enable compile-time domain object binding without inheritance.

### Additional Reusable Abstractions

- `validate(schema, data, target)` — schema-driven validation for `body|query|params`
- `isValidNumber(value)` / `convertValue(value, type)` — type coercion utilities
- `parseUrl(url, options)` — `src/utils/url-parser.ts` with decode/format options

### Anti-Patterns / Inconsistencies (updated)

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
- **Parallel in-memory stores**: `contactsStore` (contacts.ts) reimplements repository patterns that Payload handles via collections — redundant abstraction layer.

## testing-strategy

## Stack

- **Integration**: Vitest 4.0 (`vitest.config.mts`, setup: `vitest.setup.ts`) — `pnpm test:int`
- **E2E**: Playwright 1.58 (`playwright.config.ts`) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially (`test:int` → `test:e2e`)

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Page Objects**: Helper functions like `login()` in `tests/helpers/` abstract E2E interactions

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- Playwright webServer auto-starts `pnpm dev` on `http://localhost:3000`

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **withAuth HOC** (`src/auth/withAuth.ts:55-108`): Wraps route handlers with JWT auth. Usage: `export const GET = withAuth(async (req, { user }, routeParams) => {...}, { roles: ['admin'] })`
- **Generic Typed Dependencies** (`src/services/gradebook.ts:36-55`): `GradebookServiceDeps<T...>` interface decouples service from Payload — reuse this pattern for new services
- **Validation Middleware** (`src/middleware/validation.ts:201-278`): Schema-driven validation via `createValidationMiddleware(schema)` — apply to new API routes
- **Constructor DI** (`src/services/gradebook.ts:72`): Services accept deps via constructor — follow this pattern, don't use global singletons
- **Payload Collection Config** (`src/collections/Users.ts`): CollectionConfig with typed fields, access controls, and hooks — model new collections on this

## Improvement Areas

- **Dual auth systems**: `src/auth/user-store.ts` (SHA-256, in-memory) vs `src/auth/auth-service.ts` (PBKDF2, JWT) — inconsistent hashing. Pick one (`AuthService` preferred) and migrate
- **Role mismatch**: `UserStore.UserRole` ('admin'|'user'|'guest'|'student'|'instructor') vs `RbacRole` ('admin'|'editor'|'viewer') in `src/auth/_auth.ts` — no alignment
- **N+1 in dashboard** (`src/app/(frontend)/dashboard/page.tsx:52-73`): Fetches enrollments then loops to get lessons — batch-fetch all at once like the page already does
- **Unsafe type casts** (`src/app/(frontend)/dashboard/page.tsx:44`): Uses `as unknown as PayloadDoc` instead of proper type guards — replace with type guard functions
- **Redundant stores**: `contactsStore` reimplements Payload collection patterns — prefer direct Payload queries for new features

## Acceptance Criteria

- [ ] New services use `GradebookServiceDeps`-style typed dependencies, not direct Payload imports
- [ ] New API routes apply `createValidationMiddleware` with explicit `ValidationSchema`
- [ ] New collections follow `src/collections/Users.ts` pattern (access controls, hooks, typed fields)
- [ ] Auth flows use `withAuth` HOC, not manual header parsing
- [ ] Tests co-located with source (`*.test.ts` next to `*.ts`) using `vi.fn()` mocks
- [ ] No `as unknown as` casts — use proper type guards
- [ ] No new in-memory stores — use Payload collections for persistence
- [ ] Run `pnpm test:int` and `pnpm test:e2e` pass before marking done

{{TASK_CONTEXT}}
