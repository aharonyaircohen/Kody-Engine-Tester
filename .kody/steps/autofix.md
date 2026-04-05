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
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, pages, security, services, utils, validation

## LearnHub LMS

Multi-tenant Learning Management System where organizations create courses, instructors build curricula, and students enroll and track progress. Built with Next.js App Router, Payload CMS admin panel, and PostgreSQL.

## Module/Layer Structure

```
Frontend Routes (Next.js App Router)
├── (frontend)/          # Student/instructor dashboards, notes, courses
├── (payload)/admin/     # Payload CMS admin panel at /admin
└── app/api/            # Custom REST endpoints (enroll, gradebook, notifications)

Middleware Layer
├── auth-middleware.ts   # JWT authentication
├── role-guard.ts       # RBAC (student, instructor, admin)
├── rate-limiter.ts      # Request rate limiting
├── csrf-middleware.ts   # CSRF protection
└── request-logger.ts   # Request logging

Payload Collections (src/collections/)
├── Users.ts             # Auth-enabled, roles: admin/instructor/student
├── Courses.ts           # Course definitions
├── Modules.ts           # Ordered course sections
├── Lessons.ts           # Video, text, interactive content
├── Quizzes.ts           # Multiple choice, free text, code
├── Assignments.ts       # Submission + rubric grading
├── Enrollments.ts       # Student ↔ course, progress tracking
├── Discussions.ts       # Threaded per-lesson
├── Certificates.ts      # Auto-generated on completion
├── Notifications.ts     # Enrollment, grades, deadlines
├── NotificationsStore.ts
├── EnrollmentStore.ts
├── QuizAttempts.ts
├── Media.ts             # File uploads via Payload (sharp processing)
└── notes.ts             # Prototype lessons

Services (src/services/)
├── grading.ts / quiz-grader.ts      # Assignment and quiz auto-grading
├── gradebook.ts / gradebook-payload.ts  # Per-student, per-course aggregation
├── progress.ts            # Enrollment progress tracking
├── course-search.ts       # Course search/filtering
├── notifications.ts       # Notification dispatch
├── discussions.ts          # Threaded discussion management
└── certificates.ts        # Certificate generation

Access Control
└── role-guard.ts         # JWT-based RBAC middleware
```

## Data Flow

1. **Auth Flow**: JWT issued on login → stored in httpOnly cookie → `auth-middleware.ts` validates → `role-guard.ts` enforces RBAC
2. **Enrollment Flow**: Student → POST `/api/enroll` → EnrollmentStore collection → progress tracked via `progress.ts`
3. **Grading Flow**: Submission → `Submissions.ts` collection → `grading.ts` service → score stored → `gradebook.ts` aggregates
4. **API Pattern**: Payload auto-generates REST at `/api/<collection>`; custom endpoints in `src/app/api/`

## Infrastructure

- **Docker**: `docker-compose.yml` with Payload + PostgreSQL services
- **CI**: `payload migrate && pnpm build` on push
- **Image Processing**: `sharp` for media uploads
- **GraphQL**: Available at `/api/graphql` and `/api/graphql-playground`
- **Admin**: Payload CMS admin panel at `/admin`

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

## Learned 2026-04-04 (task: 403-260404-211531)

- Uses vitest for testing
- Uses eslint for linting

## Learned 2026-04-05

**Security**: Sanitization utilities in `src/security/sanitizers.ts` — `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`, path traversal prevention; always validate/sanitize user input before rendering or querying

**URL Shortener**: `src/utils/url-shortener.ts` — async `generateShortCode(url, options)` using SHA-256 base62 encoding; accepts optional `salt` for randomness; throws on empty URL

**Middleware Layer**: Auth via JWT httpOnly cookie → `auth-middleware.ts` → `role-guard.ts` (RBAC: admin/instructor/student); rate-limiter, csrf-middleware, request-logger in `src/middleware/`

**In-Memory Stores**: Map-based stores (CertificatesStore, DiscussionsStore, EnrollmentStore) use `Map<id, entity>` with sequence generators for IDs

**Discussion Threads**: Max 3 levels deep; use `getThreadDepth()` helper; replies sorted chronologically; top-level posts sorted pinned-first then by date

**Certificate Numbers**: Format `LH-{courseId}-{year}-{sequence}` — see `src/collections/certificates.ts:generateCertificateNumber()`

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `EnrollmentStore`, `Note`, `Quiz`, `QuizAttempt`, `Assignment`, `Submission`, `Discussion`, `DiscussionPost`, `Certificate`, `Task`, `NotificationsStore`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Single note retrieval/update
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET/POST /api/discussions` — Discussion posts
- `POST /api/tasks` — Task creation
- `GET/PATCH/DELETE /api/tasks/[id]` — Task CRUD

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `QuizResult`, `AssignmentResult`, `Enrollment`, `Certificate`, `CertificateNumber`, `Module`, `Task`, `TaskStatus`, `TaskPriority`, `DiscussionPost`, `RichTextContent`, `PayloadGradebookService`, `CourseSearchService`, `NotesStore`, `DiscussionsStore`, `ModuleStore`, `TaskStore`, `EnrollmentStore`

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Validation Middleware** (`src/security/validation-middleware.ts`): Request-level input validation and sanitization using schema-based parsing; extracts structured errors by path.
- **CSRF Middleware** (`src/middleware/csrf-middleware.ts`): Double-submit cookie pattern; token rotation on success.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union (`Ok`/`Err`) with `map`, `mapErr`, `andThen`, `match` combinators and `tryCatch`/`fromPromise` helpers.
- **Context/Provider** (`src/contexts/auth-context.tsx`): React Context pattern for auth state with automatic token refresh scheduling via `setTimeout` in `AuthProvider`.

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
- `validate(config)` — schema-based request validation middleware
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
- **Payload Mocking**: `createMockPayload()` factory wrapping `vi.fn()` — used in service tests (`src/services/course-search.test.ts`)
- **Vitest Setup**: Shared setup file at `./vitest.setup.ts` (configured in `vitest.config.mts`)

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **Result type for error handling**: `src/utils/result.ts` — use `Result.ok()` / `Result.err()` and `.match()` pattern instead of throwing; see `src/services/grading.ts` for usage
- **HOC for auth routes**: `src/auth/withAuth.ts` wraps route handlers; always use `withAuth(handler, 'editor')` pattern for protected routes
- **Service layer typing**: Services accept dep interfaces (e.g., `GradingServiceDeps`); don't couple to concrete Payload types
- **Type assertions in tests**: Use `createMockPayload()` factory from `src/services/course-search.test.ts` for mocking Payload SDK calls

## Improvement Areas

- **Type safety gaps**: `dashboard/page.tsx:1` uses `as unknown as` casts — prefer proper type guards over type assertions
- **Dual auth systems**: `UserStore` (SHA-256) vs `AuthService` (PBKDF2+JWT) — password hashing is inconsistent; avoid mixing auth patterns
- **Role divergence**: `UserStore.UserRole` ('student'/'instructor') vs `RbacRole` ('editor'/'viewer') — no alignment between stores
- **N+1 risk**: Dashboard batch-fetches lessons but other pages may not — verify related data is fetched together

## Acceptance Criteria

- [ ] TypeScript compilation passes with no errors (`pnpm tsc`)
- [ ] ESLint passes with no violations (`pnpm lint`)
- [ ] Vitest integration tests pass (`pnpm test:int`)
- [ ] Playwright E2E tests pass (`pnpm test:e2e`)
- [ ] Payload migrations run successfully (`pnpm payload migrate`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Type assertions replaced with proper type guards where feasible
- [ ] Auth patterns use consistent service (prefer `AuthService` + JWT over `UserStore`)
- [ ] New services follow `ServiceDeps<T>` interface pattern for dependency injection

{{TASK_CONTEXT}}
