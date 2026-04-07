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
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils

## Updated (2026-04-07)

- src/ structure now includes `models` and `routes` directories; `validation` directory removed
- Database: PostgreSQL via `@payloadcms/db-postgres` (see docker-compose.yml for local Postgres setup)
- E2E testing: Playwright 1.58.2 with `playwright.config.ts`
- CI pipeline: `payload migrate && pnpm build` (see `ci` script in package.json)
- Docker support: Dockerfile (multi-stage) + docker-compose.yml with Payload + Postgres services
- Key config files: `payload.config.ts`, `next.config.ts`, `vitest.config.mts`, `AGENTS.md` (Payload CMS rules)
- Path aliases: `@/*` maps to `./src/*`, `@payload-config` maps to `./src/payload.config.ts`
- Dependencies: `graphql`, `sharp` (image processing), `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`
- Dev dependencies: `@kody-ade/engine`, `jsdom`, `tsx`, `vite-tsconfig-paths`, `dotenv`

## conventions

## Learned 2026-04-07 (task: conventions-update-260407)

- CSS modules use `.module.css` naming (see `ModuleList.module.css`)
- Security utilities in `src/security/sanitizers.ts` (sanitizeHtml, sanitizeSql, sanitizeUrl)
- Services layer in `src/services/` for business logic (discussions.ts)
- Collections can export both config and TypeScript interfaces (see `src/collections/certificates.ts`)
- Stores use private class fields (`private certificates: Map<>`) with `Map` for in-memory data
- `'use client'` directive required on all React client components
- Named exports for utilities, types, stores, and services; default export only for page components
- `import type` used for Payload types to avoid bundling runtime dependencies
- Context usage: `useContext(AuthContext)` with named import from context file
- fetch with `Authorization: Bearer` header pattern for authenticated API calls
- Error silencing with empty `.catch(() => {})` for non-critical fallback behavior

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (with `NotificationSeverity`: info/warning/error), `users_sessions`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**Database Schema:**

- `users` — id, email, hash, salt, reset_password_token, login_attempts, lock_until, lastLogin, permissions (text[])
- `users_sessions` — \_order, \_parent_id, id, created_at, expires_at
- `media` — id, alt, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y
- `payload_kv` — key/value store for key-value data
- `payload_locked_documents` — locked document tracking

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationFilter`, `NotificationSeverity`

**Utilities:** `Schema` class (mini-Zod, `src/utils/schema.ts`) with `StringSchema`, `NumberSchema`, `BooleanSchema` — supports `.optional()` and `.default()` modifiers, throws `SchemaError` on validation failure

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Validation Middleware**: `src/middleware/validation.ts` provides schema-based validation for request body/query/params with type conversion and typed error results (`ValidateResult` discriminated union).

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
- `validate(schema, data, target)` from `src/middleware/validation.ts` — schema-based request validation
- `parseUrl(url, options)` from `src/utils/url-parser.ts` — protocol/host/path/query/fragment extraction

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

- **DI Container**: `src/utils/di-container.ts` — use `Container.register(token, factory)` with singleton/transient lifecycle; service deps use typed interfaces (e.g., `GradebookServiceDeps<T>`)
- **Auth HOC**: `src/auth/withAuth.ts` wraps route handlers; use `extractBearerToken` + `checkRole` for RBAC
- **Validation Middleware**: `src/middleware/validation.ts` — call `validate(schema, data, target)` returning `ValidateResult` discriminated union
- **Result Type**: `src/utils/result.ts` — use `Result<T, E>` for explicit error handling in services
- **Store Pattern**: `src/collections/contacts.ts` — `contactsStore` with `getById|create|update|delete|query` methods; private `Map<>` fields
- **Schema Validation**: `src/utils/schema.ts` — use `Schema` class with `.optional()` and `.default()` modifiers

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) in `src/auth/` — password hashing is inconsistent; consolidate on one scheme
- **Role divergence**: `UserStore.UserRole` (admin/user/guest/student/instructor) vs `RbacRole` (admin/editor/viewer) — no alignment; reconcile role hierarchies
- **Type casts**: `dashboard/page.tsx` uses `as unknown as` instead of proper type guards; prefer discriminated unions or type predicates
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not; audit `src/app/api/` handlers for batch loading opportunities
- **Error silencing**: `.catch(() => {})` used non-critically (e.g., `src/pages/auth/profile.tsx:27`); ensure silent catches are intentional and documented

## Acceptance Criteria

- [ ] All Critical and Major findings from review are fixed with minimal surgical edits
- [ ] Each fix verified by running `pnpm test:int` after the change
- [ ] No new TypeScript errors introduced (run `pnpm lint` if available)
- [ ] Auth consistency: password hashing uses single algorithm across the codebase
- [ ] Role types aligned: `UserRole` and `RbacRole` share a common union or mapping
- [ ] No `as unknown as` casts remain in modified files; use proper type narrowing
- [ ] Silent `.catch(() => {})` blocks documented with comment explaining why non-critical
- [ ] Build passes: `pnpm build` completes without errors
- [ ] Changes confined to the specific files identified in review findings — no refactoring of unrelated code

{{TASK_CONTEXT}}
