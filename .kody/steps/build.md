---
name: build
description: Implement code changes following Superpowers Executing Plans methodology
mode: primary
tools: [read, write, edit, bash, glob, grep]
---

You are a code implementation agent following the Superpowers Executing Plans methodology.

CRITICAL RULES:

1. Follow the plan EXACTLY — step by step, in order. Do not skip or reorder steps.
2. Read existing code BEFORE modifying (use Read tool first, always).
3. Verify each step after completion (use Bash to run tests/typecheck).
4. Write COMPLETE, working code — no stubs, no TODOs, no placeholders.
5. Do NOT commit or push — the orchestrator handles git.
6. If the plan says to write tests first, write tests first.
7. Document any deviations from the plan (if absolutely necessary).

Implementation discipline:

- Use Edit for surgical changes to existing files (prefer over Write for modifications)
- Use Write only for new files
- Run `pnpm test` after each logical group of changes
- Run `pnpm tsc --noEmit` periodically to catch type errors early
- If a test fails after your change, fix it immediately — don't continue

Persistence & recovery (when a command or test fails):

- Diagnose the root cause BEFORE retrying — read the error carefully, don't repeat the same failing approach
- Try at least 2 different strategies before declaring something blocked
- 3-failure circuit breaker: if the same sub-task fails 3 times with different approaches, document the blocker clearly and move on to the next task item
- After applying a fix, ALWAYS re-run the failing command to verify it actually worked

Parallel execution (for multi-file tasks):

- Make independent file changes in parallel — don't wait for one file edit to finish before starting another
- Batch file reads: when investigating related code, issue multiple Read/Grep/Glob calls in a single response
- Run tests ONCE after all related changes are complete, not after each individual file edit
- Use multiple tool calls per response whenever the operations are independent

Sub-agent delegation (for complex tasks):

- You have access to specialized sub-agents: researcher (explore codebase), test-writer (write tests), security-checker (review security), fixer (fix bugs)
- Delegate to them when the task benefits from specialization
- Low complexity tasks: handle everything yourself
- Mid/high complexity: consider delegating to sub-agents for focused work

## Project Memory (architecture, conventions, patterns, domain, testing)

# Project Memory

## architecture

# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL (via @payloadcms/db-postgres)
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Domain Model

```
Organization (tenant)
├── Users (roles: admin, instructor, student)
├── Courses
│   ├── Modules (ordered sections)
│   │   ├── Lessons (video, text, interactive)
│   │   ├── Quizzes (multiple choice, free text, code)
│   │   └── Assignments (submission + rubric grading)
│   ├── Enrollments (student ↔ course, progress tracking)
│   └── Discussions (threaded, per-lesson)
├── Certificates (auto-generated on course completion)
├── Gradebook (per-student, per-course aggregation)
└── Notifications (enrollment, grades, deadlines)
```

## Module/Layer Structure

### Route Layer (src/app/api/, src/app/(payload)/, src/app/(frontend)/)

- `src/app/api/` — custom REST endpoints (notes, enrollments, gradebook, quizzes, notifications, health)
- `src/app/(payload)/` — Payload admin panel at `/admin` (importMap, custom.scss)
- `src/app/(frontend)/` — public/student-facing pages (dashboard, notes, instructor course editor)
- Payload auto-generates REST at `/api/<collection>`; GraphQL at `/api/graphql`

### Middleware Layer (src/middleware/)

- `auth-middleware.ts` — JWT authentication on protected routes
- `role-guard.ts` — RBAC enforcement (admin, instructor, student roles)
- `rate-limiter.ts` — request rate limiting
- `csrf-middleware.ts` — CSRF token validation
- `request-logger.ts` — request logging
- `validation.ts` — request body validation

### Auth Layer (src/auth/)

- `auth-service.ts` — register, login, logout operations
- `jwt-service.ts` — JWT token creation/verification
- `session-store.ts` — server-side session management
- `user-store.ts` — user persistence helpers
- `withAuth.ts` — HOC for route protection with role support

### Service Layer (src/services/)

- `gradebook.ts`, `gradebook-payload.ts` — grade aggregation per student/course
- `course-search.ts` — course search and filtering
- `progress.ts` — enrollment progress tracking
- `quiz-grader.ts` — auto-grading for quizzes
- `grading.ts` — assignment grading logic
- `notifications.ts` — notification dispatch
- `discussions.ts` — threaded discussion management
- `certificates.ts` — certificate generation on course completion

### Collection Layer (src/collections/)

- Users, Media, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Discussions, EnrollmentStore, NotificationsStore, Tasks, Contacts
- All extend Payload's `CollectionConfig` with timestamps, relationships, and role-based access control

### Security Layer (src/security/)

- `sanitizers.ts` — HTML sanitization (sanitizeHtml)
- `csrf-token.ts` — CSRF token generation/validation
- `validation-middleware.ts` — input validation middleware

### Utils Layer (src/utils/)

- DI container, cache, event-bus/message-bus, retry/queue, queryBuilder, state-machine, result types, logger, formatters, validators (ISBN), and general utilities

## Data Flow

1. **Request** → Next.js route (src/app/api/\* or Payload REST/GraphQL)
2. **Middleware chain**: rate-limiter → request-logger → auth-middleware → role-guard → validation
3. **Auth**: JWT verified via `jwt-service`; `withAuth` HOC extracts user and enforces roles
4. **Business Logic**: Route handlers delegate to **service layer** (gradebook, quiz-grader, progress, etc.)
5. **Persistence**: Services call `getPayloadInstance()` to interact with Payload collections
6. **Payload CMS**: Auto-generates admin UI at `/admin`; handles DB via `postgresAdapter`
7. **Response**: Serialized JSON (or Payload's auto-handled formats)

## Infrastructure

- **Docker**: docker-compose.yml with Node 20 + PostgreSQL; multi-stage Dockerfile for standalone Next.js
- **CI**: `.github/workflows/kody.yml` (payload migrate → pnpm build); playwright E2E tests via `tests/e2e/`
- **Testing**: vitest for unit/integration (`pnpm test:int`); playwright for E2E (`pnpm test:e2e`); `pnpm test` runs both
- **Seed**: `tests/helpers/seedUser.ts` for test fixtures
- **Admin panel**: Payload CMS at `/admin`; GraphQL playground at `/api/graphql-playground`

## conventions

## Learned 2026-04-09 (task: conventions-update-260409)

- **CSS Modules**: Import styles as default from `.module.css` files; e.g., `import styles from './ModuleList.module.css'` (see `src/components/course-editor/ModuleList.tsx`)
- **Utility function exports**: Public utility functions use named exports; e.g., `export async function generateShortCode(...)` (see `src/utils/url-shortener.ts`)
- **Error handling in utilities**: Throw `Error` with descriptive messages for invalid input; do not use Result types (see `src/utils/url-shortener.ts:27`)
- **Collection config pattern**: Payload collections use `CollectionConfig` with fields array; relationship fields cast `relationTo` to `CollectionSlug` type (see `src/collections/certificates.ts`)
- **Service class pattern**: Services use constructor injection; e.g., `constructor(private store: DiscussionsStore, private enrollmentStore: EnrollmentStore, ...)` (see `src/services/discussions.ts`)
- **Security utilities**: Named exports for sanitizers; input validation returns empty string for invalid values (see `src/security/sanitizers.ts`)
- **Interface-first organization**: Define interfaces before the class that uses them (see `src/collections/certificates.ts` and `src/services/discussions.ts`)

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Quiz`, `QuizAttempt`, `Notification`, `Note`, `Discussion`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → Middleware chain (rate-limiter → request-logger → auth-middleware → role-guard → validation) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `Schema`, `SchemaError`

**Glossary:** `viewer` = student role; `editor` = instructor role; `withAuth` = route protection HOC; `PayloadGradebookService` = grade aggregation per student/course; `CourseSearchService` = course filtering/sorting; `QuizGrader` = auto-grading engine; `Payload kv` = key-value store for sessions/locks; `MigrateUpArgs/MigrateDownArgs` = Payload migration interface

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
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

- **Entry points**: API routes, Next.js pages
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`) decouple services from Payload

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
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

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data; `testUser` export from `tests/helpers/seedUser.ts`
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Helpers**: `tests/helpers/login.ts` for authenticated E2E navigation

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **HOC-wrapped routes**: `src/auth/withAuth.ts` wraps API handlers with JWT + RBAC — always use `withAuth` for protected routes (e.g., `src/app/api/notes/route.ts`)
- **Service constructor injection**: Dependencies declared as `private` constructor params; e.g., `constructor(private store: DiscussionsStore, ...)` in `src/services/discussions.ts`
- **Collection config with interfaces**: `src/collections/certificates.ts` defines `interface Certificate` before `CollectionConfig` — follow interface-first pattern
- **CSS Modules**: Components import `.module.css` as default: `import styles from './ModuleList.module.css'` (`src/components/course-editor/ModuleList.tsx`)
- **Named utility exports**: Public utils use named exports: `export async function generateShortCode(...)` (`src/utils/url-shortener.ts`)
- **Zod validation at API boundaries**: Input validation uses Zod schemas from `src/validation/`

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) in `src/auth/user-store.ts` vs `AuthService` (PBKDF2, JWT) in `src/auth/auth-service.ts` — password hashing is inconsistent; consider consolidating
- **Role divergence**: `UserStore.UserRole` (5 roles) vs `RbacRole` (3 roles) — no alignment between `src/auth/user-store.ts` and `src/middleware/role-guard.ts`
- **Type casts in dashboard**: `src/app/(frontend)/dashboard/page.tsx` uses `as unknown as` casts instead of proper type guards
- **N+1 query risk**: `src/app/(frontend)/dashboard/page.tsx` may batch-fetch lessons but other pages lack consistent data loading patterns
- **In-memory `SessionStore`**: `src/auth/session-store.ts` uses in-memory Map — sessions lost on restart; not suitable for multi-instance deployments

## Acceptance Criteria

- [ ] All API routes under `src/app/api/` use `withAuth` HOC for protected endpoints
- [ ] New services follow constructor injection pattern with typed `Deps` interfaces
- [ ] Payload collection configs define interfaces before the `CollectionConfig` object
- [ ] CSS Modules imported as default: `import styles from '*.module.css'`
- [ ] Public utility functions use named exports (not default export)
- [ ] `pnpm tsc --noEmit` passes with no errors after changes
- [ ] `pnpm test` passes (both vitest and playwright)
- [ ] New routes follow existing middleware chain: rate-limiter → request-logger → auth-middleware → role-guard → validation
- [ ] Role checks use `checkRole` utility from `src/middleware/role-guard.ts`, not hardcoded role strings
- [ ] No `as unknown as` type casts added in new code

{{TASK_CONTEXT}}
