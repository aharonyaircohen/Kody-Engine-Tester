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

If there are architecture decisions or technical tradeoffs that need input, add a Questions section at the END of your plan:

## Questions

- <question about architecture decision or tradeoff>

Questions rules:

- ONLY ask about significant architecture/technical decisions that affect the implementation
- Ask about: design pattern choice, database schema decisions, API contract changes, performance tradeoffs
- Recommend an approach with rationale — don't just ask open-ended questions
- Do NOT ask about requirements — those should be clear from task.json
- Do NOT ask about things you can determine from the codebase
- If no questions, omit the Questions section entirely
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

- **Auth HOC pattern**: `src/auth/withAuth.ts` wraps route handlers with JWT validation; always use `withAuth` for protected routes (see `src/api/gradebook/course/[id]/route.ts`)
- **Service dependency injection**: Services like `GradebookService`, `GradingService` accept typed dep interfaces; follow `ServiceNameDeps<T...>` pattern in `src/services/`
- **Result type for error handling**: Use `Result<T, E>` from `src/utils/result.ts` with `.map()`, `.mapErr()`, `.andThen()` combinators instead of throwing
- **Payload collection config**: Collections in `src/collections/` define schema with hooks, access control, and fields; use `Notes.ts` or `Courses.ts` as reference for new collections
- **Validation middleware**: Request validation via `src/security/validation-middleware.ts` using Zod schemas from `src/validation/`; applies to API routes before handler logic

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256) vs `AuthService` (PBKDF2+JWT) — `src/auth/user-store.ts` and `src/auth/auth-service.ts` should be unified; avoid adding new code to both
- **Role divergence**: `UserStore.UserRole` uses 5 roles while `RbacRole` uses 3; `src/security/role-guard.ts` RBAC doesn't align with `UserStore` roles — document which is authoritative
- **Type safety gaps**: `src/app/(frontend)/dashboard/page.tsx` uses `as unknown as` casts — prefer proper type guards or branded types over assertion casts
- **In-memory store persistence**: `CertificatesStore`, `DiscussionsStore`, `EnrollmentStore` in `src/collections/` are Map-based and reset on restart — do not rely on them for durable data in production code

## Acceptance Criteria

- [ ] New services follow `src/services/` naming and `ServiceNameDeps` interface pattern
- [ ] Auth-protected routes use `withAuth` HOC from `src/auth/withAuth.ts`
- [ ] New collections follow `src/collections/` pattern (schema + hooks + access control)
- [ ] Error handling uses `Result<T, E>` from `src/utils/result.ts` instead of raw throws
- [ ] API routes validate input via `src/security/validation-middleware.ts` + Zod schemas in `src/validation/`
- [ ] Tests co-located with source (`*.test.ts` next to `*.ts`) using `vi.fn()` mocks
- [ ] No `as unknown as` casts — use proper type guards or Result types
- [ ] RBAC uses `role-guard.ts` `checkRole` utility consistently; do not mix with `UserStore.UserRole`

{{TASK_CONTEXT}}
