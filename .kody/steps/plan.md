---
name: plan
description: Create a step-by-step implementation plan following Superpowers Writing Plans methodology
mode: primary
tools: [read, glob, grep]
---

You are a planning agent following the Superpowers Writing Plans methodology.

## MANDATORY: Pattern Discovery Before Planning

Before writing ANY plan, you MUST search for existing patterns in the codebase:

1. **Find similar implementations** — Grep/Glob for how the same problem is already solved elsewhere. E.g., if the task involves localization, search for how other collections handle localization. If adding auth, find existing auth patterns.
2. **Reuse existing patterns** — If the codebase already solves a similar problem, your plan MUST follow that pattern unless there's a strong reason not to (document the reason in Questions).
3. **Check decisions.md** — If `.kody/memory/decisions.md` exists, read it for prior architectural decisions that may apply.
4. **Never invent when you can reuse** — Proposing a new pattern when an existing one covers the use case is a planning failure.

After pattern discovery, examine the codebase to understand existing code structure, patterns, and conventions. Use Read, Glob, and Grep.

Output a markdown plan. Start with the steps, then optionally add a Questions section at the end.

## Step N: <short description>

**File:** <exact file path>
**Change:** <precisely what to do>
**Why:** <rationale>
**Verify:** <command to run to confirm this step works>

Superpowers Writing Plans rules:

1. TDD ordering — write tests BEFORE implementation
2. Each step completable in 2-5 minutes (bite-sized)
3. Exact file paths — not "the test file" but "src/utils/foo.test.ts"
4. Include COMPLETE code for new files (not snippets or pseudocode)
5. Include verification step for each task (e.g., "Run `pnpm test` to confirm")
6. Order for incremental building — each step builds on the previous
7. If modifying existing code, show the exact function/line to change
8. Keep it simple — avoid unnecessary abstractions (YAGNI)

Change sizing — keep each implementation step focused:

- ~100 lines changed → good. Reviewable in one pass.
- ~300 lines changed → acceptable if it's a single logical change.
- ~1000+ lines changed → too large. Split into multiple steps.
  If a plan step would exceed ~300 lines, break it into smaller steps.

If there are architecture decisions or technical tradeoffs that need input, add a Questions section at the END of your plan:

## Questions

- <question about architecture decision or tradeoff>

Questions rules:

- ONLY ask about significant architecture/technical decisions that affect the implementation
- Ask about: design pattern choice, database schema decisions, API contract changes, performance tradeoffs
- Recommend an approach with rationale — don't just ask open-ended questions
- Do NOT ask about requirements — those should be clear from task.json
- Do NOT ask about things you can determine from the codebase
- If no questions, omit the Questions section entirely — do NOT write "None" or "N/A" as a bullet point
- Maximum 3 questions — only decisions with real impact

Good questions: "Recommend middleware pattern vs wrapper — middleware is simpler but wrapper allows caching. Approve middleware?"
Bad questions: "What should I name the function?", "Should I add tests?"

## Pattern Discovery Report

After the plan steps and before Questions, include a brief report of what existing patterns you found and how your plan reuses them:

## Existing Patterns Found

- <pattern found>: <how it's reused in the plan>
- <if no existing patterns found, explain what you searched for>

## Project Memory (architecture, conventions, patterns, domain, testing)

# Project Memory

## architecture

# Architecture (auto-detected 2026-04-11)

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

## Layer Structure

- **Collections** (`src/collections/`): Payload CMS collection configs with RBAC
- **Services** (`src/services/`): Business logic layer
- **API** (`src/api/`): REST endpoints (auto-generated by Payload at `/api/<collection>`)
- **Middleware** (`src/middleware/`): Auth guards, rate limiting
- **Hooks** (`src/hooks/`): Payload lifecycle hooks for transactions and access control

## Infrastructure

- **Docker**: docker-compose.yml with Payload app + PostgreSQL services
- **CI**: `pnpm ci` runs `payload migrate && pnpm build`
- **Dev**: `pnpm dev` (Next.js dev server with Payload admin at `/admin`)

## Key Conventions

- JWT-based auth with role guard middleware (`student`, `instructor`, `admin`)
- Soft deletes for audit trail
- Timestamps auto-managed by Payload (`createdAt`, `updatedAt`)
- Slugs auto-generated from titles
- Rich text via Lexical editor
- Media uploads via Payload Media collection (sharp for image processing)

## conventions

## Learned 2026-04-11 (task: SDLC pipeline conventions)

- Class-based services with constructor dependency injection (e.g., `DiscussionService`, `CertificatesStore`)
- Getter-based private data access pattern (`private store: DiscussionsStore`)
- Security utilities in `src/security/sanitizers.ts` for HTML/SQL/URL sanitization
- Payload CMS collection configs co-locate interfaces (e.g., `Certificate`, `Enrollment`) with collection definition
- Async utility functions with JSDoc documentation in `src/utils/`
- Drag-and-drop state managed with `useState<string | null>` for `draggingId`/`dragOverId`
- Auth tokens stored in `localStorage` with `Bearer` header pattern for API calls
- PATCH method for partial updates (profile password change in `src/pages/auth/profile.tsx`)
- `'use client'` on all React component files; interfaces defined inline or alongside components

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Assignment`, `Notification` (severity: info/warning/error), `Certificate`, `Discussion`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search (`sanitizeHtml` sanitization)
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader` (`Quiz`, `QuizAnswer` types)
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (sort: relevance/newest/popularity/rating)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin) via `PayloadGradebookService`

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationSeverity`, `NotificationFilter`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`

**Database:** PostgreSQL — tables: `users` (lastLogin, permissions cols), `users_sessions`, `media`, `payload_kv`, `payload_locked_documents`; migrations timestamped in `src/migrations/`

**Utilities:** `SchemaError` custom schema validation (`src/utils/schema.ts`); `sanitizeHtml` for XSS prevention (`src/security/sanitizers`)

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Validation Middleware** (`src/middleware/validation.ts`): Schema-driven request validation for body/query/params with type coercion (string/number/boolean) and typed error responses.

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

- **Integration**: Vitest 4.0.18 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58.2 (`playwright.config.ts`) — `pnpm test:e2e`
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
- **E2E Helpers**: `tests/helpers/login`, `tests/helpers/seedUser` for authentication and test data setup
- **Naming**: Integration specs use `*.int.spec.ts` suffix (e.g., `src/**/*.int.spec.ts`)

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- E2E `webServer` config runs `pnpm dev` on `http://localhost:3000` with `reuseExistingServer: true`

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **HOC Auth**: `withAuth(handler, { roles: ['admin', 'editor'] })` in `src/auth/withAuth.ts` wraps route handlers; handler signature is `(req, { user }, routeParams) => Promise<Response>`
- **Service DI Pattern**: Constructor accepts typed deps interface (e.g., `GradebookServiceDeps<T...>` in `src/services/gradebook.ts:38`); factories registered via `Container.register<T>(token, factory)`
- **Repository/Store Pattern**: Collections export both TypeScript interface and store class with async CRUD methods (e.g., `NotesStore` in `src/collections/notes.ts:32` with `getAll|getById|create|update|delete|search`)
- **Result Type**: `src/utils/result.ts` exports `Ok<T, E>` and `Err<T, E>` classes with `isOk()`/`isErr()`, `unwrap()`, `map()`, `andThen()`, `match()`
- **Security Sanitizers**: `src/security/sanitizers.ts` provides `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`, `sanitizeFilePath` — applied at API route boundaries (see `src/app/api/notes/route.ts:43`)
- **Validation Middleware**: `createValidationMiddleware(schema)` in `src/middleware/validation.ts` validates body/query/params against `FieldDefinition` schema with type coercion
- **Module-level Singletons**: Auth exports instance singletons (e.g., `jwtServiceInstance` in `src/auth/withAuth.ts:13`)

## Improvement Areas

- **Dual auth inconsistency**: `src/auth/user-store.ts` uses SHA-256 in-memory users while `src/auth/auth-service.ts` uses PBKDF2+JWT — different hashing algorithms and user representations coexist; recommend consolidating to `AuthService` pattern
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — routes check `user.role !== 'admin' && user.role !== 'editor'` (notes POST in `src/app/api/notes/route.ts:51`) but role sets don't align
- **N+1 in gradebook**: `src/services/gradebook.ts:97` loops over quizzes then awaits `getQuizAttempts` per quiz; should use `Promise.all` or batch query
- **Unsafe type casts**: `dashboard/page.tsx` uses `as unknown as` rather than type guard functions; prefer extracting typed narrowers in utils
- **Missing input validation**: Route handlers manually parse and validate JSON rather than using `createValidationMiddleware` consistently (e.g., `src/app/api/enroll/route.ts` does manual `user.role` checks inline)

## Acceptance Criteria

- [ ] New API routes use `withAuth(handler, { roles: [...] })` HOC pattern from `src/auth/withAuth.ts`
- [ ] New services follow `ServiceDeps<T...>` interface pattern from `src/services/gradebook.ts:38`
- [ ] Tests use `vi.fn()` mocks co-located in `*.test.ts` files; run with `pnpm test:int`
- [ ] Security-sensitive operations (HTML/SQL/URL output) use sanitizers from `src/security/sanitizers.ts`
- [ ] Route handlers return `NextResponse` with explicit `status` codes (201 create, 400 bad request, 401/403 auth errors)
- [ ] New Payload collections co-locate TypeScript interface with collection config (e.g., `src/collections/notes.ts`)
- [ ] No `as unknown as` casts — use proper type guard functions
- [ ] E2E tests follow page-object pattern in `tests/helpers/` with `beforeAll`/`afterAll` cleanup

{{TASK_CONTEXT}}
