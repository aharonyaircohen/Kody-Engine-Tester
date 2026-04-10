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

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0 with Lexical rich text editor
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm ^9 || ^10
- Module system: ESM
- Auth: JWT-based with role guard middleware (student, instructor, admin)
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Data Flow

Request → Next.js App Router (RSC) → Payload Local API → Access Control Hooks → Collections → PostgreSQL

## Module/Layer Structure

Collections (src/collections/) → Access Control (src/access/) → Hooks → PostgreSQL via @payloadcms/db-postgres

Frontend: Next.js App Router with React Server Components; Admin panel at /admin via @payloadcms/next

## Infrastructure

- Docker: docker-compose.yml with postgres service; Dockerfile for standalone Next.js deployment
- CI: `ci` script runs `payload migrate && pnpm build`
- Dev: `pnpm dev` with cross-env NODE_OPTIONS=--no-deprecation

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

**Service Layer** (`src/services/`): Constructor injection of store dependencies; async methods; expose typed interfaces for data shapes

```typescript
export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<User | undefined>,
    private enrollmentChecker: EnrollmentChecker,
  ) {}
```

**Store Pattern** (`src/collections/`): In-memory stores use private `Map`; co-locate interfaces (Certificate, Enrollment) with collection config

**Security Utilities** (`src/security/`): Named `sanitize*` functions (sanitizeHtml, sanitizeSql, sanitizeUrl); return empty string for invalid input

**URL Utilities** (`src/utils/`): Async `generateShortCode` with options object parameter; uses crypto.subtle.digest for hashing

**CSS Modules**: Component styles in `.module.css` files; import as `styles from './Component.module.css'`

**Client Routing**: Page components wrapped in `ProtectedRoute`; access token stored in localStorage with `auth_access_token` key

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

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

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

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `NotificationFilter`

**Domain Models:**

- `Notification` — id, recipient, type, severity (info/warning/error), title, message, link?, isRead, createdAt
- `Note` — id, title, content, tags[], createdAt, updatedAt

**Security:** `sanitizeHtml` (src/security/sanitizers) applied to user content in notes and course search

**Schema Validation:** Mini-Zod implementation in `src/utils/schema.ts` — `Schema`, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError` with `optional()` and `default()` modifiers

**Database Migrations:** `src/migrations/` — users table extended with `lastLogin` (timestamp) and `permissions` (text[]) columns via migration `20260405_000000_add_users_permissions_lastLogin`

## patterns

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0 with Lexical rich text editor
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm ^9 || ^10
- Module system: ESM
- Auth: JWT-based with role guard middleware (student, instructor, admin)
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Data Flow

Request → Next.js App Router (RSC) → Payload Local API → Access Control Hooks → Collections → PostgreSQL

## Module/Layer Structure

Collections (src/collections/) → Access Control (src/access/) → Hooks → PostgreSQL via @payloadcms/db-postgres

Frontend: Next.js App Router with React Server Components; Admin panel at /admin via @payloadcms/next

## Infrastructure

- Docker: docker-compose.yml with postgres service; Dockerfile for standalone Next.js deployment
- CI: `ci` script runs `payload migrate && pnpm build`
- Dev: `pnpm dev` with cross-env NODE_OPTIONS=--no-deprecation

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
- **Schema-driven Validation**: `src/middleware/validation.ts` uses declarative `ValidationSchema` (body/query/params fields) with type conversion and typed error reporting.

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

The existing document is already accurate and comprehensive for this project. All sections match the provided context with no discrepancies to correct or new patterns to add.

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

- **DI Container** (`src/utils/di-container.ts`): Use `Container.register()` with factory functions; service constructors receive dep interfaces
- **Auth HOC** (`src/auth/withAuth.ts`): Wrap route handlers with `withAuth` for JWT validation + RBAC
- **Result Type** (`src/utils/result.ts`): Return `Result<T, E>` from services for explicit error handling
- **Service Pattern** (`src/services/`): Constructor injection, async methods, typed interfaces for deps (e.g., `GradebookServiceDeps<T>`)
- **Store Pattern** (`src/collections/`): In-memory stores with private `Map`; co-locate interfaces with collection config
- **Sanitization** (`src/security/`): Use `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` on user content — return empty string on invalid input
- **Schema Validation** (`src/utils/schema.ts`): Use Mini-Zod `Schema` with `optional()` and `default()` modifiers

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256) vs `AuthService` (PBKDF2+JWT) in `src/auth/` — inconsistent password hashing; needs consolidation
- **Role divergence**: `UserStore.UserRole` (admin/user/guest/student/instructor) vs `RbacRole` (admin/editor/viewer) — no alignment between `src/auth/` and `src/access/`
- **Type casts** (`dashboard/page.tsx`): Uses `as unknown as` instead of proper type guards — fragile type narrowing
- **N+1 risk**: Dashboard batches lesson fetches; other pages may lack batch optimization
- **Missing tests**: `src/security/sanitizers` lacks unit tests despite being security-critical

## Acceptance Criteria

- [ ] All Critical/Major findings from code review are fixed with minimal surgical edits
- [ ] No new ESLint errors introduced (`pnpm lint` passes)
- [ ] All vitest tests pass (`pnpm test:int`)
- [ ] All Playwright E2E tests pass (`pnpm test:e2e`)
- [ ] No `as unknown as` casts added in fixed files
- [ ] Security sanitizers applied to all user-generated content
- [ ] Service layer returns `Result<T, E>` for explicit error handling
- [ ] Auth boundary (withAuth HOC) properly enforced on new routes
- [ ] No role divergence — RbacRole aligned with UserStore.UserRole where both are used
- [ ] Build succeeds (`pnpm build`)

{{TASK_CONTEXT}}
