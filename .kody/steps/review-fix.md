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
- Testing: vitest 4.0.18
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Project Domain

LearnHub LMS — multi-tenant Learning Management System built on Next.js App Router with Payload CMS and PostgreSQL.

## Layer Structure

- **Frontend**: Next.js App Router with React Server Components (`src/app/(frontend)/`)
- **Admin/CMS**: Payload admin panel (`src/app/(payload)/`, `src/collections/`)
- **Auth**: JWT-based with role guard middleware (`src/auth/`, `src/security/`)
- **API**: Payload auto-generates REST at `/api/<collection>`
- **Services/Utils**: `src/services/`, `src/utils/`, `src/hooks/`
- **Access Control**: `src/access/` for Payload access control functions
- **Validation**: `src/validation/` for input validation

## Database

- PostgreSQL via `@payloadcms/db-postgres` 3.80.0
- Connection via `DATABASE_URL` env var
- Payload manages migrations in `src/migrations/`

## Infrastructure

- **Container**: `docker-compose.yml` (Node 20 + PostgreSQL)
- **CI**: `payload migrate && pnpm build` via `pnpm ci`
- **Docker**: `Dockerfile` for standalone Next.js output

## Key Dependencies

- `@payloadcms/next`, `@payloadcms/ui`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical` (all 3.80.0)
- `graphql` 16.8.1, `sharp` 0.34.2 for image processing

## Development Patterns

- Run `generate:types` after schema changes
- Run `tsc --noEmit` to validate TypeScript
- Payload collections in `src/collections/`, globals in `src/globals/`
- Custom React components in `src/components/`
- See `AGENTS.md` for Payload-specific development rules

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

**Service Pattern**: Services use constructor dependency injection; store classes manage state (e.g., `DiscussionsStore`, `CertificatesStore` in `src/collections/`)

```typescript
// src/services/discussions.ts
export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<User | undefined>,
    private enrollmentChecker: EnrollmentChecker,
  ) {}
```

**JSDoc**: Utilities use JSDoc comments for inline documentation (see `src/utils/url-shortener.ts`)

**Sanitization**: Security utilities in `src/security/` handle HTML, SQL, and URL sanitization (see `src/security/sanitizers.ts`)

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Single note operations
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `gradeQuiz` from `@/services/quiz-grader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (params: `q`, `difficulty`, `tags`, `sort`, `page`, `limit`)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `NotificationFilter`

**Database Schema:** `users` table includes `lastLogin` (timestamp) and `permissions` (text[]) columns added by migration `20260405_000000_add_users_permissions_lastLogin`

**Utilities:** `Schema` class (mini-Zod) in `src/utils/schema.ts` with `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema`; `sanitizeHtml` in `@/security/sanitizers`

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Validation Middleware** (`src/middleware/validation.ts`): Schema-driven request validation for `body`, `query`, and `params` targets with type coercion and `ValidateResult` discriminated union.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.
- **Rubric-Based Grading Strategy** (`src/services/grading.ts`): `GradingService` validates rubric scores against criteria, checks instructor authorization per course, and computes total grade with late penalty handling.

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
    ↓
Validation Middleware (src/middleware/validation.ts)
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService)
    ↓
Repository Layer (Payload Collections, contactsStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Module Boundaries

- **Entry points**: API routes, Next.js pages (Server Components in `src/app/(frontend)/`)
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`) decouple services from Payload
- **Batch-fetching pattern**: Dashboard page avoids N+1 by fetching all lessons for enrolled courses in a single query

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- `validate(schema, data, target)` — schema-driven validation for request fields
- Zod schemas in `src/validation/` for input validation at API boundaries

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.

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

- **Setup**: `vitest.setup.ts` for global test setup (jsdom environment)
- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **E2E Navigation**: Tests use absolute URLs (e.g., `page.goto('http://localhost:3000/admin')`) without baseURL

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **DI Container** (`src/utils/di-container.ts`): Use `Container.register<T>(token, factory)` with singleton/transient lifecycle; detect circular deps via `resolving` Set
- **Service Constructor DI** (`src/services/*.ts`): Accept typed dep interfaces (e.g., `GradebookServiceDeps<T...>`); never instantiate services directly — resolve via container
- **Auth HOC** (`src/auth/withAuth.ts`): Wrap route handlers with `withAuth(handler, { roles?: RbacRole[] })`; use `checkRole` for inline role checks
- **Result Type** (`src/utils/result.ts`): Return `Result<T, E>` from service methods; use `.match()` for exhaustive handling — never throw from services
- **Validation Middleware** (`src/middleware/validation.ts`): Apply `validate(schema, data, target)` in route handlers before business logic
- **Store Pattern** (`src/collections/contacts.ts`): Expose `contactsStore` with `getById|create|update|delete|query`; follow same pattern for new collections

## Improvement Areas

- **Role divergence**: `UserStore.UserRole` ('admin'|'user'|'guest'|'student'|'instructor') vs `RbacRole` ('admin'|'editor'|'viewer') — migrations and service layer use different enums; align via migration or adapter
- **Dual auth systems**: `UserStore` (SHA-256) coexists with `AuthService` (PBKDF2+JWT); prefer `AuthService` for new auth flows and deprecate `UserStore` password handling
- **Type casts in dashboard** (`src/app/(frontend)/dashboard/page.tsx`): Uses `as unknown as` rather than proper type guards; replace with exhaustive type predicates
- **N+1 risk**: Only `dashboard/page.tsx` uses batch-fetching; other pages fetching enrolled courses/lessons may regress; audit `src/app/(frontend)/` for similar patterns
- **Missing error boundaries**: React components in `src/components/` lack error boundaries; critical for admin panel stability

## Acceptance Criteria

- [ ] Each Critical/Major finding fixed with a single surgical Edit (no file rewrites)
- [ ] `pnpm test:int` passes after each fix (run individually, not batched)
- [ ] `pnpm test:e2e` passes after all fixes (full suite, no `.only()` committed)
- [ ] `pnpm build` succeeds before declaring done
- [ ] No new `as unknown as` casts introduced; existing ones reviewed for necessity
- [ ] Role types aligned — no `UserRole` vs `RbacRole` mismatch in modified files
- [ ] Auth flows use `AuthService` (not `UserStore`) in any new or modified code
- [ ] Deviation from expected fix documented inline (// deviation: reason)

{{TASK_CONTEXT}}
