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

```
API Routes (src/app/api/*, src/api/*)
  └── Services (src/services/*) — business logic: gradebook, quiz-grader, course-search, progress, notifications
        └── Payload Collections (src/collections/*) — data access via Payload CMS Local API
              └── PostgreSQL (@payloadcms/db-postgres)
```

### Layer Details

- **API Routes** (`src/app/api/`, `src/api/`): REST endpoints — auth, courses, enrollments, gradebook, notes, notifications, quizzes
- **Auth Layer** (`src/auth/`): AuthService, JwtService, session-store, user-store; JWT auth with refresh token rotation
- **Collections** (`src/collections/`): Payload CMS schemas — Users, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Media
- **Services** (`src/services/`): gradebook, grading, quiz-grader, course-search, progress, notifications, discussions, certificates
- **Middleware** (`src/middleware/`): auth, csrf, rate-limiter, request-logger, role-guard, validation
- **Security** (`src/security/`): csrf-token, sanitizers, validation-middleware
- **Components** (`src/components/`): auth, board, command-palette, contacts, course-editor, dashboard, notes, notifications

## Data Flow

```
Client → Next.js Route Handler → Auth Middleware (JWT verify) → Service Layer → Payload Collections → PostgreSQL
                                                          ↓
                                                     Role Guard (RBAC: admin, editor, viewer)
```

## Infrastructure

- **Docker**: docker-compose.yml with payload + postgres services
- **CI**: `payload migrate && pnpm build` (payload migrate, next build)
- **Image Processing**: sharp for media uploads
- **GraphQL**: Payload GraphQL endpoint at `/api/graphql`

## conventions

## Learned 2026-04-18 (SDLC pipeline conventions)

- Collections use singular slugs: `slug: 'certificates'` (see `src/collections/certificates.ts`)
- CSS Modules: `*.module.css` files use kebab-case (e.g., `ModuleList.module.css` imported as `styles`)
- Services receive store dependencies via constructor injection (e.g., `DiscussionService` takes `store`, `enrollmentStore`, `getUser`, `enrollmentChecker`)
- Utility functions use async/await with `crypto.subtle` for Web Crypto API (SHA-256 hashing in `src/utils/url-shortener.ts`)
- Sanitizers return early with empty string for invalid input (`sanitizeUrl`, `sanitizeSql`, `sanitizeHtml` in `src/security/sanitizers.ts`)
- Page components use default exports; route handlers and services use named exports
- Interfaces for input types are prefixed (e.g., `UpdateLessonInput`, `IssueCertificateInput`, `UrlShortenerOptions`)

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (`NotificationSeverity`: info | warning | error)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search; `GET /api/notes/[id]` — single note
- `GET /api/quizzes/[id]` — Quiz retrieval; `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`; `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (params: q, difficulty, tags, sort, page, limit)
- `POST /api/enroll` — Enrollment (viewer role required); requires `{ courseId }` in body
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET/POST /api/notifications` — Notification CRUD (based on `NotificationFilter`)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Database Schema (via migrations):**

- `users` — id, email, hash, salt, reset_password_token, login_attempts, lock_until, lastLogin, permissions
- `users_sessions` — id, created_at, expires_at
- `media` — id, alt, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y

**Validation:** `Schema<T>` base class with `StringSchema`, `NumberSchema`, `BooleanSchema`; `optional()` and `default()` modifiers; throws `SchemaError`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationFilter`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`).
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
- **Validation Middleware** (`src/middleware/validation.ts`): Schema-based request validation with typed `FieldDefinition`, converts and validates `body|query|params` against declared schemas before route handlers execute.

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
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Setup File**: `vitest.setup.ts` loaded globally via `setupFiles` in vitest config
- **Helpers**: E2E helpers like `login` stored in `tests/helpers/`

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- Dedicated `test-ci.yml` workflow runs on PR events

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

---

## Repo Patterns

### Singleton Auth Exports

`src/auth/index.ts` exports module-level singletons: `userStore`, `sessionStore`, `jwtService`. Services receive these via dependency injection, not direct instantiation.

### HOC Auth Pattern

`src/auth/withAuth.ts` wraps route handlers. Pattern:

```typescript
export const POST = withAuth(
  async (req, ctx) => {
    /* ... */
  },
  { role: 'editor' },
)
```

### DI Container Registration

`src/utils/di-container.ts` — use `container.register<T>(token, factory, lifecycle)` for service registration. Lifecycle options: `Singleton`, `Transient`.

### Schema Validation at Boundaries

`src/middleware/validation.ts` — use `FieldDefinition[]` for typed `body|query|params` validation before route handlers execute.

### Sanitizer Early Return

`src/security/sanitizers.ts` — `sanitizeUrl`, `sanitizeSql`, `sanitizeHtml` return empty string `''` for invalid input, no exceptions thrown.

---

## Improvement Areas

- **Dual auth systems**: `src/auth/user-store.ts` (SHA-256) vs `src/auth/auth-service.ts` (PBKDF2/JWT) — password hashing is inconsistent; avoid adding new code to `UserStore`.
- **Role divergence**: `RbacRole = 'admin'|'editor'|'viewer'` in middleware vs `UserRole = 'admin'|'user'|'student'|'instructor'|'guest'` in collections — new code should use `RbacRole`.
- **Type narrowing in `src/app/(frontend)/dashboard/page.tsx`**: uses `as unknown as` casts — prefer proper type guards for maintainability.
- **N+1 risk**: Dashboard batch-fetches lessons; other pages may miss eager loading — check `src/services/progress.ts` for `findOne` vs `findMany` patterns.

---

## Acceptance Criteria

- [ ] All new enum values traced to every consumer with `grep -r "<newValue>" src/`
- [ ] No direct SQL string interpolation — use Payload's query builder or parameterized patterns
- [ ] `withAuth` HOC applied to all new API routes; role check matches `RbacRole` enum
- [ ] Sanitizers used for all user-controlled strings before DB write
- [ ] No `dangerouslySetInnerHTML` or `.html_safe` on user-controlled data
- [ ] New services registered in `di-container.ts` with typed deps interfaces
- [ ] Integration tests added for new service methods using `vi.fn()` mocks
- [ ] E2E tests added for new API endpoints in `tests/e2e/`
- [ ] No new `as unknown as` casts — use proper type narrowing
- [ ] `pnpm test` passes locally before PR submission

{{TASK_CONTEXT}}
