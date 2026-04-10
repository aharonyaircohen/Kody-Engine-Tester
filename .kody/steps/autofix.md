---
name: autofix
description: Investigate root cause then fix verification errors (typecheck, lint, test failures)
mode: primary
tools: [read, write, edit, bash, glob, grep]
---

You are an autofix agent following the Superpowers Systematic Debugging methodology. The verification stage failed. Fix the errors below.

IRON LAW: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST. If you haven't completed Phase 1, you cannot propose fixes.

## Phase 1 — Root Cause Investigation (BEFORE any edits)

1. Read the full error output — what exactly failed? Full stack traces, line numbers, error codes.
2. Identify the affected files — Read them to understand context.
3. Check recent changes: run `git diff HEAD~1` to see what changed.
4. Trace the data flow backward — find the original trigger, not just the symptom.
5. Classify the failure pattern:
   - **Type error**: mismatched types, missing properties, wrong generics
   - **Test failure**: assertion mismatch, missing mock, changed behavior
   - **Lint error**: style violation, unused import, naming convention
   - **Runtime error**: null reference, missing dependency, config issue
   - **Integration failure**: API contract mismatch, schema drift
6. Identify root cause — is this a direct error in new code, or a side effect of a change elsewhere?

## Phase 2 — Pattern Analysis

1. Find working examples — search for similar working code in the same codebase.
2. Compare against the working version — what's different?
3. Form a single hypothesis: "I think X is the root cause because Y."

## Phase 3 — Fix (only after root cause is clear)

1. Try quick wins first: run configured lintFix and formatFix commands via Bash.
2. Implement a single fix — ONE change at a time, not multiple changes at once.
3. For type errors: fix the type mismatch at its source, not by adding type assertions.
4. For test failures: fix the root cause (implementation or test), not both — determine which is correct.
5. For lint errors: apply the specific fix the linter suggests.
6. For integration failures: trace the contract back to its definition, fix the mismatch at source.
7. After EACH fix, re-run the failing command to verify it passes.
8. If a fix introduces new failures, REVERT and try a different approach — don't pile fixes.
9. Do NOT commit or push — the orchestrator handles git.

## Red Flags — STOP and return to Phase 1 if you catch yourself:

- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "I don't fully understand but this might work"
- Proposing solutions before tracing the data flow

## Rules

- Fix ONLY the reported errors. Do NOT make unrelated changes.
- Minimal diff — use Edit for surgical changes, not Write for rewrites.
- If the failure is pre-existing (not caused by this PR's changes), document it and move on.

## Project Memory (architecture, conventions, patterns, domain, testing)

# Project Memory

## architecture

# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (unit/integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

**Data Flow**: API routes → Services → Payload Collections → PostgreSQL

- **src/app/api/**: REST endpoints organized by domain (auth, courses, gradebook, notifications, quizzes, notes)
- **src/auth/**: JWT service, session-store, user-store, withAuth wrapper, role guard
- **src/services/**: Business logic (gradebook, certificates, progress, notifications, discussions, quiz-grader, course-search)
- **src/collections/**: Payload CMS collection configs (Users, Media, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes)
- **src/middleware/**: Express-style middleware (auth, rate-limiter, role-guard, csrf, request-logger, validation)
- **src/security/**: Security utilities (csrf-token, sanitizers, validation-middleware)
- **src/migrations/**: Payload DB migrations (2 migrations applied)
- **src/hooks/**: React hooks (useCommandPalette, useCommandPaletteShortcut)

## Payload Collections

Users, Media, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes

## Infrastructure

- **Docker**: docker-compose.yml with payload + postgres services
- **CI**: GitHub Actions — `payload migrate` + `pnpm build` on merge
- **Dev**: `pnpm dev` (Next.js dev), `pnpm payload` (Payload CLI)
- **Tests**: `pnpm test:int` (vitest), `pnpm test:e2e` (playwright), `pnpm test` (both)

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

**CSS Modules**: Use `import styles from './Component.module.css'` pattern for component-scoped styling

**Auth Pattern**: Store tokens in `localStorage` as `auth_access_token`; send as Bearer token in `Authorization` header

**Security Utilities**: Sanitizers export pure functions (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`) using regex replacement; HTML entity decoding via constant map

**Service Layer**: Business logic in classes with dependency injection (store + getUser + enrollmentChecker constructor pattern)

**JSDoc**: Document utility functions with `@example` blocks and parameter descriptions

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

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Note`, `Assignment`, `Submission`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader` (`gradeQuiz` function)
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Security:** Input sanitization via `sanitizeHtml` in `src/security/sanitizers`; schema validation via custom `Schema` class hierarchy in `src/utils/schema.ts`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationSeverity`, `NotificationFilter`, `PayloadGradebookService`, `CourseSearchService`, `SchemaError`

**Database Migrations:** `20260322_233123_initial` (core tables), `20260405_000000_add_users_permissions_lastLogin` (adds `lastLogin` timestamp and `permissions` text[] to `users`)

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts`, `rate-limiter.ts`, `validation.ts` implement Express-style chainable middleware for Next.js.
- **Validation Middleware** (`src/middleware/validation.ts`): Schema-driven request validation for body/query/params with typed field definitions and error aggregation.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`; `GradingService` uses rubric-based grading strategies.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService)
    ↓
Repository Layer (Payload Collections, contactsStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Module Boundaries

- **Entry points**: API routes, Next.js pages
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`) decouple services from Payload

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- `validate(schema, data, target)` — validation middleware factory
- Zod schemas in `src/validation/` for input validation at API boundaries

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
- **Type casting abuse**: `src/app/(frontend)/dashboard/page.tsx` relies heavily on `as unknown as` casts instead of proper type narrowing.

## testing-strategy

# LearnHub LMS Testing Strategy

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
- **E2E Helpers**: `tests/helpers/login.ts`, `tests/helpers/seedUser.ts` for auth and test user lifecycle

## Vitest Configuration

- Setup file: `vitest.setup.ts` loaded before test suite
- Environment: `jsdom`
- Include patterns: `src/**/*.test.ts`, `src/**/*.test.tsx`, `tests/**/*.test.ts`, `tests/int/**/*.int.spec.ts`

## Playwright Configuration

- `webServer` auto-starts `pnpm dev` on port 3000 for E2E tests
- `forbidOnly: true` prevents committed `.only()` tests
- Retries: 2x on CI, 0 locally
- Chromium only via `Desktop Chrome` channel

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- `kody-watch` schedule runs every 30 minutes; `kody-ci` triggers on PR close, review, issue comment, and push to main/dev

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

---

## Repo Patterns

- **Auth HOC usage**: `src/auth/withAuth.ts` wraps route handlers; always use `extractBearerToken` from same dir
- **DI pattern**: `src/utils/di-container.ts` — register factories with `container.register(token, factory)`, resolve with `container.resolve(token)`
- **Result type**: `src/utils/result.ts` — use `Result.ok(val)` / `Result.err(msg)` instead of throwing
- **Service constructor pattern**: `{ store, getUser, enrollmentChecker }` deps passed in constructor (see `GradebookService`)
- **Sanitizer usage**: `src/security/sanitizers/sanitizeHtml.ts` exports `sanitizeHtml(str)` for untrusted input
- **Vitest mocks**: co-located `.test.ts` files use `vi.mock()` for Payload SDK; `vi.fn().mockResolvedValue(value)` for async stubs
- **Playwright fixtures**: `tests/helpers/seedUser.ts` creates test users; `tests/helpers/login.ts` handles auth flow

## Improvement Areas

- **Type casting abuse**: `src/app/(frontend)/dashboard/page.tsx` uses `as unknown as` casts — prefer proper type guards or Zod parsing
- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — password hashing is inconsistent
- **Role divergence**: `UserStore.UserRole` vs `RbacRole` — no single source of truth for user roles
- **N+1 risk**: Dashboard fetches lessons individually in some pages; prefer batch operations
- **Missing error boundaries**: React components lack error boundaries; runtime errors may crash entire page

## Acceptance Criteria

- [ ] All vitest unit/integration tests pass (`pnpm test:int`)
- [ ] All Playwright E2E tests pass (`pnpm test:e2e`)
- [ ] TypeScript compilation succeeds (`pnpm tsc --noEmit`)
- [ ] ESLint passes with no errors (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format`)
- [ ] Payload migrations applied (`pnpm payload migrate`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No `as unknown as` casts introduced in new code
- [ ] All API routes use `withAuth` HOC where required
- [ ] All sanitizer functions applied to untrusted input at API boundaries

{{TASK_CONTEXT}}
