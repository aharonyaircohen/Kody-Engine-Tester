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

# Architecture (auto-detected 2026-04-10)

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

## Infrastructure

- Docker: docker-compose.yml with Payload app + PostgreSQL services
- Dockerfile: multi-stage build for Next.js standalone output
- CI: `payload migrate && pnpm build`

## Key Files

- `src/payload.config.ts` — Payload CMS configuration
- `src/payload-types.ts` — Generated TypeScript types
- `vitest.config.mts` — Unit/integration test configuration
- `playwright.config.ts` — E2E test configuration
- `AGENTS.md` — Payload CMS development rules and patterns

## Data Flow

Payload collections (in `src/collections/`) → Local API → Next.js Route Handlers (`src/app/api/`) → Frontend Components (`src/components/`)

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

## Additional Patterns (learned 2026-04-10)

**Service Layer**: Business logic in `src/services/` as classes (e.g., `DiscussionService` with constructor injection of stores and dependencies)

**Store Pattern**: Data stores in `src/collections/` as classes with `Map`-backed private state (e.g., `CertificatesStore`)

**Security Utilities**: Sanitization helpers in `src/security/sanitizers.ts` (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`)

**Auth Components**: `ProtectedRoute` wrapper for protected pages; `AuthContext` via React Context; `PasswordStrengthBar`, `SessionCard` components

**Drag-and-Drop UI**: Use React drag events with `dataTransfer.setData/getData` for reorderable lists (see `ModuleList.tsx`)

**CSS Modules**: Component styles co-located as `ComponentName.module.css` in kebab-case

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

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

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification` (`NotificationSeverity`: info/warning/error), `NotificationFilter`, `SchemaError` (custom validation)

**Database Schema (migrations):**

- `users`: id, email, updated_at, created_at, reset_password_token, reset_password_expiration, salt, hash, login_attempts, lock_until, **lastLogin**, **permissions** (text[])
- `media`: id, alt, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y
- `users_sessions`: id, \_order, \_parent_id, created_at, expires_at
- `payload_kv`: id, key, data (jsonb)
- `payload_locked_documents`: (，追用於鎖定文檔)

**Schema Utility:** `src/utils/schema.ts` provides mini-Zod with `Schema`, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError`, `Infer<T>` type helper, and builder methods `.optional()` / `.default()`

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts`, `src/middleware/validation.ts`, and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Validation Middleware** (`src/middleware/validation.ts`): Schema-driven field validation for `body|query|params` with type coercion (string→number|boolean) and typed `ValidationError` results.

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
- `validate(schema, data, target)` from `validation.ts` — schema-based input validation
- `parseUrl(url, options)` from `url-parser.ts` — URL decomposition with decode/showPort options
- Zod schemas in `src/validation/` for input validation at API boundaries

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not; `gradebook.ts` iterates enrollments sequentially instead of parallel fetching.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards; service interfaces like `GradebookServiceDeps` rely on unsafe property access with fallback chains.

## testing-strategy

# LearnHub LMS Testing Strategy

## Stack

- **Integration**: Vitest 4.0.18 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58.2 (`playwright.config.ts`) — `pnpm test:e2e`
- **Unit/Integration Location**: `src/**/*.test.ts`, `src/**/*.test.tsx` co-located with source
- **Integration Specs**: `tests/int/**/*.int.spec.ts`
- **E2E**: `tests/e2e/*.spec.ts` with page-object helpers in `tests/helpers/`
- **Runner**: `pnpm test` executes lint + `pnpm test:int` + `pnpm test:e2e` sequentially

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data; `login()` helper in `tests/helpers/login`
- **Fake Timers**: `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`

## CI Quality Gates

- `payload migrate` → `pnpm build` → `pnpm test` pipeline
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- CI retries 2x; dev retries 0x
- Runs on push to `main`/`dev` for `src/**`, `kody.config.json`, `package.json`

## Coverage

- No explicit threshold; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **Service classes**: `src/services/DiscussionService.ts` — constructor injection of stores/dependencies, business logic in class methods
- **Store pattern**: `src/collections/CertificatesStore.ts` — `Map`-backed private state, `getById|create|update|delete|query` methods
- **Auth HOC**: `src/auth/withAuth.ts` — wraps route handlers with JWT validation + RBAC via `checkRole`
- **Validation middleware**: `src/middleware/validation.ts` — schema-driven `body|query|params` validation with type coercion
- **Result type**: `src/utils/result.ts` — `Result<T, E>` discriminated union; use `.match()` for handling
- **DI container**: `src/utils/di-container.ts` — `Container.register<T>()` with singleton/transient lifecycles, circular dep detection via `resolving` Set
- **Security sanitizers**: `src/security/sanitizers.ts` — `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` helpers

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing (`src/auth/`)
- **Role divergence**: `UserStore.UserRole` ('admin'|'user'|'guest'|'student'|'instructor') vs `RbacRole` ('admin'|'editor'|'viewer') — no alignment in `src/security/` or `src/auth/`
- **N+1 risk**: `src/app/(frontend)/gradebook.ts` iterates enrollments sequentially; use `Promise.all()` or batch-fetch
- **Unsafe type casts**: `src/app/(frontend)/dashboard/page.tsx` uses `as unknown as` instead of proper type guards; use `Result<T, E>.match()` or type narrowing
- **Inconsistent error handling**: Non-critical fallbacks use `.catch(() => {})` silently — prefer `Result` type or explicit error logging

## Acceptance Criteria

- [ ] All Critical/Major findings from code review are fixed
- [ ] `pnpm test:int` passes — no vitest failures
- [ ] `pnpm test:e2e` passes — no Playwright test failures
- [ ] `pnpm lint` passes — no ESLint errors
- [ ] `pnpm build` succeeds — no TypeScript/Next.js build errors
- [ ] Fixes use `Edit` for surgical changes — no file rewrites
- [ ] Tests run after EACH fix to verify nothing breaks
- [ ] No new `as unknown as` casts introduced in fixed files
- [ ] No `.catch(() => {})` silent fallbacks added in fixed code

{{TASK_CONTEXT}}
