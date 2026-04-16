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

# Architecture (auto-detected 2026-04-16)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (int), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Application Structure

- Frontend: Next.js App Router with React Server Components
- Backend/CMS: Payload CMS (admin panel at `/admin`)
- Auth: JWT-based with role guard middleware (`student`, `instructor`, `admin`)
- Rich Text: Lexical editor via `@payloadcms/richtext-lexical`
- Media: File uploads via Payload Media collection (sharp for image processing)

## Module/Layer Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes
│   └── (payload)/           # Payload admin routes
├── collections/             # Payload collection configs
├── globals/                 # Payload global configs
├── components/              # Custom React components
├── hooks/                   # Hook functions
├── access/                  # Access control functions
├── middleware/              # Express/Next.js middleware
├── services/                # Business logic services
├── utils/                   # Utility functions
├── validation/              # Input validation schemas
└── payload.config.ts        # Main Payload config
```

## Infrastructure

- Docker: docker-compose with Node.js + PostgreSQL services
- Dockerfile: Multi-stage build (deps → builder → runner), standalone output
- CI: `payload migrate && pnpm build` on merge
- Database migrations via Payload CLI (`payload migrate`)

## conventions

**Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug

**Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred

```typescript
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
```

**Exports**: Named exports for utilities/types; default export for page components only

**Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks (see `src/pages/auth/profile.tsx:27`)

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`; security utilities in `src/security/`; CSS Modules alongside components as `*.module.css`

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components

**State Management**: In-memory store classes (e.g., `CertificatesStore`, `DiscussionsStore`) for client-side state; service classes inject store + dependencies (see `src/services/discussions.ts`)

**Security Utilities**: Sanitization helpers in `src/security/sanitizers.ts` (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`); always sanitize user-provided URLs to prevent injection attacks

**Recursion Safety**: Limit recursion depth explicitly (e.g., thread replies capped at depth 3, see `getThreadDepth` in `src/services/discussions.ts:14`)

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

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Domain Models:**

- `Notification` (`src/models/notification.ts`): `id`, `recipient`, `type`, `severity` (info/warning/error), `title`, `message`, `link?`, `isRead`, `createdAt`
- `NotificationFilter`: `severity?`, `isRead?`, `recipientId?`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Validation:** Mini-Zod schema builder (`src/utils/schema.ts`): `Schema`, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError`, `Infer<T>` type utility

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationFilter`, `NotificationSeverity`

**Migrations:** `src/migrations/` — timestamped SQL migrations using `@payloadcms/db-postgres` (`20260322_233123_initial`, `20260405_add_users_permissions_lastLogin`)

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Validation Middleware** (`src/middleware/validation.ts`): Generic `validate(schema, data, target)` function with `FieldDefinition`, `ValidationSchema` for body/query/params validation.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.

### Architectural Layers

```
Route Handlers (src/app/*/route.ts, src/api/*)
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
- **Validation boundary**: `src/middleware/validation.ts` + Zod schemas in `src/validation/`

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- `validate(schema, data, target)` — generic request validation
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
- `test-ci.yml` runs a health check on every PR (echo + exit 1 to verify CI setup)

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **HOC Auth**: `src/auth/withAuth.ts` wraps route handlers — use this pattern, not manual JWT parsing
- **DI Container**: `src/utils/di-container.ts` — register services with `container.register(token, factory)`
- **Result Type**: `src/utils/result.ts` — use `Result.ok()` / `Result.fail()` for explicit error handling
- **Repository Pattern**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query`
- **Middleware Chain**: `src/middleware/request-logger.ts` — `createRequestLogger(config)` factory pattern
- **Sanitization**: Always use `src/security/sanitizers.ts` (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`) for user input

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256) and `AuthService` (PBKDF2) coexist — risk of inconsistent password hashing (`src/auth/UserStore.ts`, `src/auth/AuthService.ts`)
- **Role mismatch**: `UserStore.UserRole` has 5 values vs `RbacRole` has 3 — alignment needed in `src/auth/withAuth.ts`
- **Type casting**: `dashboard/page.tsx` uses `as unknown as` — should use proper type guards instead
- **N+1 queries**: Dashboard batches lesson fetches but other pages may not — check `src/app/(frontend)/dashboard/page.tsx`
- **Missing sanitization**: User-provided URLs must go through `sanitizeUrl` in `src/security/sanitizers.ts` before use

## Acceptance Criteria

- [ ] All Critical/Major review findings are fixed with minimal surgical edits
- [ ] Tests pass after each fix (`pnpm test:int` for integration, `pnpm test:e2e` for E2E)
- [ ] No new ESLint errors introduced
- [ ] `pnpm build` succeeds after all fixes
- [ ] Auth changes maintain role alignment between `UserStore` and `RBAC`
- [ ] User input is sanitized via `src/security/sanitizers.ts` before rendering/storage
- [ ] Type narrowing uses proper guards, not `as unknown as` casts
- [ ] No dual auth system divergence — PBKDF2 consistently used for password hashing

{{TASK_CONTEXT}}
