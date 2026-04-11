---
name: review-fix
description: Fix Critical and Major issues found during code review
mode: primary
tools: [read, write, edit, bash, glob, grep]
---

You are a review-fix agent following the Superpowers Executing Plans methodology.

The code review found issues that need fixing. Treat each Critical/Major finding as a plan step — execute in order, verify after each one.

RULES (Superpowers Executing Plans discipline):

1. Fix ONLY Critical and Major issues (ignore Minor findings)
2. Use Edit for surgical changes — do NOT rewrite entire files
3. Run tests after EACH fix to verify nothing breaks
4. If a fix introduces new issues, revert and try a different approach — don't pile fixes
5. Document any deviations from the expected fix
6. Do NOT commit or push — the orchestrator handles git

For each Critical/Major finding:

1. Read the affected file to understand full context
2. Understand the root cause — don't just patch the symptom
3. Make the minimal change to fix the issue
4. Run tests to verify the fix
5. Move to the next finding

## Project Memory (architecture, conventions, patterns, domain, testing)

# Project Memory

## architecture

# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm 9/10
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Layer Structure

### Routes → API → Services/Collections (Payload CMS)

- `src/app/api/` — Frontend API routes (courses, enrollments, gradebook, notifications, quizzes)
- `src/api/auth/` — Auth API routes (login, logout, register, refresh, profile)
- `src/collections/` — Payload collection configs (Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Users, Media)
- `src/services/` — Business logic services (certificates)
- `src/middleware/` — Auth, CSRF, rate-limiting, role-guard middleware

### Data Flow

```
Client → Next.js Route → Middleware (auth/role/rate-limit) → Payload Local API → PostgreSQL
```

- Payload REST auto-generated at `/api/<collection>`
- Custom GraphQL endpoint at `/api/graphql`
- JWT-based auth with role guard middleware (`student`, `instructor`, `admin`)

## Infrastructure

- **Containerization**: Docker + docker-compose (Node 20-alpine, PostgreSQL latest)
- **CI/CD**: GitHub Actions — `ci` script runs `payload migrate && pnpm build`
- **Dev environment**: `pnpm dev` (Next.js dev server on port 3000)
- **Admin panel**: Payload CMS at `/admin`

## Key Patterns

- JWT auth with `saveToJWT: true` for roles (fast access checks without DB lookup)
- Collection-level + field-level access control with `overrideAccess: false` in Local API
- Transaction safety: always pass `req` to nested operations in hooks
- Sharp for image processing via Payload Media collection
- CSRF protection middleware and rate limiting enabled

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

## Learned 2026-04-11 (task: SDLC pipeline conventions)

- CSS modules: `import styles from './Component.module.css'`
- Event types: `e: React.DragEvent` for drag handlers
- Service classes: `DiscussionService`, `CertificatesStore` (DependencyInjection pattern)
- Utility naming: `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` (verb+noun, camelCase)
- JSDoc with `@example` blocks for public utilities (see `src/utils/url-shortener.ts`)
- Auth flow: `localStorage.getItem('auth_access_token')` + `Authorization: Bearer ${token}` header

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Database Schema:** `users` (id, email, hash, salt, reset_token, login_attempts, lock_until, lastLogin, permissions), `users_sessions`, `media`, `courses`, `modules`, `lessons`, `enrollments`, `certificates`, `assignments`, `submissions`, `quizzes`, `quiz_attempts`, `notifications`, `notes`, `payload_kv`, `payload_locked_documents`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → Middleware (auth/role/rate-limit) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/[id]` — Note CRUD with search, sanitized via `sanitizeHtml`
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `gradeQuiz`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`, supports difficulty/tags/sort pagination
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via Payload built-in, `withAuth` HOC wraps routes, RBAC via `checkRole` (roles: `admin`, `editor`, `viewer`, `guest`), CSRF and rate-limiting middleware enabled

**Key Types:** `Notification` (`NotificationSeverity = 'info'|'warning'|'error'`, `NotificationFilter`), `Note`, `Quiz`, `QuizAnswer`, `QuizAttempt`, `Config`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`

## patterns

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
    ↓
Validation Middleware (src/middleware/validation.ts) + Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService)
    ↓
Repository Layer (Payload Collections, contactsStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- Zod schemas in `src/validation/` for input validation at API boundaries
- `validate(schema, data, target)` from `src/middleware/validation.ts` — schema-based body/query/params validator with type coercion
- `parseUrl(url, options)` from `src/utils/url-parser.ts` — protocol/host/path/query/fragment extraction

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.

## testing-strategy

## Stack

- **Integration**: Vitest 4.0 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58 (`playwright.config.ts`) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Vitest Environment**: `jsdom` with setup file `./vitest.setup.ts`
- **Vitest Include**: `['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts', 'tests/int/**/*.int.spec.ts']`
- **Playwright Projects**: Chromium only, HTML reporter, auto-starts dev server via `pnpm dev`

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- ESLint via `pnpm lint` with `--no-deprecation` flag

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **Service layer dependency injection**: Services receive deps via constructor (e.g., `GradebookService`, `GradingService`), registered in `Container` from `src/utils/di-container.ts`
- **Payload collection configs**: Collections in `src/collections/` use `overrideAccess: false` for Local API access control hooks
- **Sanitization utilities**: `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` in `src/utils/` follow verb+noun naming; used at API boundaries (e.g., notes CRUD)
- **Auth token retrieval**: Client-side uses `localStorage.getItem('auth_access_token')` with `Authorization: Bearer ${token}` header
- **CSS modules**: `import styles from './Component.module.css'` pattern in React components
- **Zod validation**: Input validation at API routes via `validate(schema, data, target)` from `src/middleware/validation.ts`

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) and `AuthService` (PBKDF2, JWT) coexist in `src/auth/` — inconsistent password hashing and user representation; needs consolidation
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment across codebase
- **Type narrowing**: `src/app/(frontend)/dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards or discriminated unions
- **N+1 query risk**: Dashboard page batch-fetches lessons but other pages (e.g., `src/app/api/courses/search`) may not batch related data

## Acceptance Criteria

- [ ] All Critical/Major code review findings are fixed with surgical Edit changes
- [ ] Each fix is verified with `pnpm test:int` before proceeding to next finding
- [ ] No file is rewritten entirely — only targeted edits are made
- [ ] Fixes follow existing patterns: DI container for services, `sanitizeHtml` for notes, `withAuth` HOC for routes
- [ ] Dual auth system inconsistency is not introduced in any new fix
- [ ] Role alignment (`admin`, `editor`, `viewer`) is preserved in any RBAC changes
- [ ] `pnpm lint` passes with no new violations introduced
- [ ] `pnpm build` succeeds after all fixes are applied

{{TASK_CONTEXT}}
