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

- **Service-layer business logic**: `src/services/discussions.ts` — named exports, async/await, typed interfaces for deps
- **Auth HOC pattern**: `src/auth/withAuth.ts` — wraps route handlers, extracts Bearer token via `extractBearerToken`, calls `checkRole`
- **Type-safe DI container**: `src/utils/di-container.ts` — `Container.register(token, factory)`, singleton/transient lifecycles
- **Store pattern**: `src/collections/contacts.ts` — `contactsStore` with `getById|create|update|delete|query` methods
- **Validation middleware**: `src/middleware/validation.ts` — `validate(schema, data, target)` returns `ValidateResult` discriminated union
- **Result type for error handling**: `src/utils/result.ts` — `Result<T, E>` discriminated union (`Ok`/`Err`)
- **CSS modules**: Component files like `ModuleList.module.css` — use `.module.css` naming convention

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) and `AuthService` (PBKDF2, JWT) co-exist — password hashing is inconsistent (`src/auth/`, `src/security/`)
- **Role divergence**: `UserStore.UserRole` uses 5 roles while `RbacRole` uses 3 — mismatch in `src/security/` vs `src/auth/`
- **Inconsistent type narrowing**: `src/app/(frontend)/dashboard/page.tsx` uses `as unknown as` casts instead of proper type guards
- **N+1 query risk**: Dashboard batch-fetches lessons but other pages may not — `src/app/(frontend)/dashboard/page.tsx`
- **Error silencing**: `.catch(() => {})` used in non-critical fallback at `src/pages/auth/profile.tsx:27` — suppress and continue pattern

## Acceptance Criteria

- [ ] All TypeScript compilation errors resolved (no `as unknown as` casts unless documented)
- [ ] All Vitest unit/integration tests pass (`pnpm test:int`)
- [ ] All Playwright E2E tests pass (`pnpm test:e2e`)
- [ ] `pnpm build` succeeds without errors
- [ ] `pnpm lint` reports no violations (or only pre-existing documented violations)
- [ ] Auth system uses single password hashing strategy (PBKDF2 via `AuthService`)
- [ ] RBAC roles aligned: `RbacRole` and `UserStore.UserRole` reconciled
- [ ] Type errors fixed at source, not suppressed with `as` casts
- [ ] No new `.catch(() => {})` error silencing added for critical paths
- [ ] All file paths referenced in errors exist and match actual project structure

{{TASK_CONTEXT}}
