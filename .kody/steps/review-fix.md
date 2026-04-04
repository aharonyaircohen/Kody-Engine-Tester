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

# LearnHub LMS Architecture

## Stack

- **Framework**: Next.js 16 App Router + Payload CMS 3.80 (headless)
- **Language**: TypeScript 5.7 (ES2022 target)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Testing**: Vitest 4.0 (integration) + Playwright 1.58 (E2E)
- **Runtime**: Node 18+ / pnpm 9+

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── (frontend)/        # Public/authenticated frontend routes
│   └── (payload)/         # Payload admin routes (/admin)
├── collections/           # Payload collection configs (Course, Lesson, Enrollment, etc.)
├── components/            # Custom React components
├── hooks/                 # Custom React hooks
├── middleware/            # Express-style middleware (rate-limiter)
├── auth/                  # Auth utilities (JWT service, session store, withAuth HOC)
├── utils/                 # Pure utility functions (debounce, retry, flatten, result)
├── services/              # Business logic services
├── api/                   # API route handlers (login, profile, etc.)
├── contexts/              # React contexts
├── validation/            # Zod schemas for input validation
├── security/              # Security utilities (password hashing, RBAC)
├── migrations/            # Payload database migrations
└── payload.config.ts      # Payload CMS configuration
```

## Layer Architecture

**Route Handler** → `src/api/*` → `src/auth/*` (withAuth HOC) → `src/services/*` → `src/collections/*` (Payload)

## Infrastructure

- **Docker**: `docker-compose.yml` (Payload app + PostgreSQL)
- **CI**: `pnpm ci` runs `payload migrate` then `pnpm build`
- **Admin**: Payload admin panel at `/admin`
- **Media**: Sharp for image processing, Payload Media collection

## Data Flow

1. Client → Next.js Route Handler (`src/app/(frontend)/api/`)
2. Auth middleware validates JWT via `src/auth/jwt-service.ts`
3. Service layer (`src/services/`) handles business logic
4. Payload collections (`src/collections/`) manage PostgreSQL via `@payloadcms/db-postgres`

## Key Configs

- `payload.config.ts` — Payload DB, auth, collections, editor (Lexical)
- `vitest.config.mts` — Integration test runner
- `playwright.config.ts` — E2E browser testing

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

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`

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
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **Result type for error handling** (`src/utils/result.ts`): Use discriminated union `Result<T, E>` — prefer `ok()`/`err()` factories over throw patterns
- **Surgical Edit over Write** (`src/auth/withAuth.ts`): `withAuth` wraps handlers — surgical edits to add roles/permissions, never rewrite the HOC
- **Validation at API boundaries** (`src/validation/`): Zod schemas validate input before service calls — see `src/api/auth/login.ts` for pattern
- **Service layer dependency injection** (`src/services/GradebookService.ts`): Constructor accepts dep interfaces (`GradebookServiceDeps`), not concrete types
- **Type-safe DI container** (`src/utils/di-container.ts`): Register with `Container.register(token, factory)` using branded token types

## Improvement Areas

- **Type assertion abuse** (`src/app/(frontend)/dashboard/page.tsx:XX`): Uses `as unknown as` casts — replace with proper type guards or branded types
- **Dual auth systems**: `UserStore` in `src/auth/user-store.ts` (SHA-256) vs `AuthService` in `src/auth/auth-service.ts` (PBKDF2) — only fix new code paths, don't unify
- **Role enum mismatch**: `UserStore.UserRole` ('admin'|'user'|'guest'|'student'|'instructor') vs `RbacRole` ('admin'|'editor'|'viewer') — avoid new code relying on either
- **N+1 query risk** in `src/app/(frontend)/dashboard/page.tsx`: Lesson enrollments fetched individually — use Payload's `depth` param or batch loader
- **Missing error wrapping**: Service methods in `src/services/` return raw errors — wrap with `Result.err()` for consistent error handling

## Acceptance Criteria

- [ ] Fix only Critical/Major issues from the review report
- [ ] Use `Edit` tool for surgical changes — no file rewrites
- [ ] Run `pnpm test:int` after each fix — all tests pass
- [ ] Run `pnpm tsc --noEmit` — zero type errors
- [ ] No `as unknown as` type assertions in changed code
- [ ] No `console.log` statements in production code
- [ ] All async operations use try-catch with proper error propagation
- [ ] Changes follow layered architecture: Route → Auth → Service → Repository
- [ ] No hardcoded secrets or config values — use environment variables
- [ ] Zod validation schemas used for all new API input validation

{{TASK_CONTEXT}}
