---
name: plan
description: Create a step-by-step implementation plan following Superpowers Writing Plans methodology
mode: primary
tools: [read, glob, grep]
---

You are a planning agent following the Superpowers Writing Plans methodology.

## Delta updates

If a prior `plan.md` already exists for this task AND the task context below contains a `## Human Feedback` section, treat this run as a delta update, not a fresh plan:

1. Read the existing plan.
2. Integrate the feedback as scope changes — add new steps, modify existing steps, or remove steps that no longer apply.
3. Preserve step numbering continuity where possible. Mark modified or added steps with "(updated)" or "(new)" suffixes so the diff is legible.
4. Do NOT discard the existing plan and start over when it still covers unchanged scope.

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

# Architecture (auto-detected 2026-04-18)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (unit/integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Auth: JWT with role guard middleware (student, instructor, admin)
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

```
Frontend Routes (src/app/(frontend)/)
├── dashboard/page.tsx
├── instructor/courses/[id]/edit/page.tsx
├── notes/ (CRUD pages)
└── page.tsx (home)
└── layout.tsx

Payload Admin Routes (src/app/(payload)/)
├── api/graphql/route.ts
├── api/graphql-playground/route.ts
└── api/[...slug]/route.ts (Payload REST)

Custom REST API (src/app/api/)
├── enroll/route.ts
├── gradebook/route.ts, gradebook/course/[id]/route.ts
├── notifications/route.ts, [id]/read/route.ts, read-all/route.ts
├── quizzes/[id]/route.ts, submit/route.ts, attempts/route.ts
├── courses/search/route.ts
├── notes/route.ts, [id]/route.ts
├── dashboard/admin-stats/route.ts
├── csrf-token/route.ts
└── health/route.ts

Auth Layer (src/auth/)
├── index.ts — exports userStore, sessionStore, jwtService
├── jwt-service.ts — JWT sign/verify
├── session-store.ts — session management
├── user-store.ts — User model and CreateUserInput type
└── withAuth.ts — route protection wrapper

Collections (src/collections/) — Payload CMS schemas
├── Users.ts (auth: true, roles: admin/instructor/student)
├── Courses.ts, Modules.ts, Lessons.ts
├── Enrollments.ts, Certificates.ts
├── Assignments.ts, Submissions.ts
├── Quizzes.ts, QuizAttempts.ts
├── Notifications.ts, Notes.ts, Media.ts, Discussions.ts

Middleware (src/middleware/)
├── auth-middleware.ts — JWT verification
├── role-guard.ts — RBAC enforcement
├── rate-limiter.ts
├── csrf-middleware.ts
├── request-logger.ts
└── validation.ts

Security (src/security/)
├── csrf-token.ts
├── sanitizers.ts
└── validation-middleware.ts

Services (src/services/)
└── certificates.service.ts (business logic)
```

## Data Flow

```
Client → Next.js App Router (RSC)
  ├── Custom API routes (src/app/api/) → Services/Auth → PostgreSQL
  └── Payload REST/GraphQL (src/app/(payload)/api/) → Payload Collections → PostgreSQL

Authentication Flow:
  POST /api/auth/login → auth-service.ts → jwt-service.ts (sign JWT)
  Subsequent requests → auth-middleware.ts → jwt-service.ts (verify JWT)
  Role checks → role-guard.ts middleware
```

## Infrastructure

- **Docker**: docker-compose.yml (Next.js + PostgreSQL)
- **CI**: `ci` script runs `payload migrate && pnpm build`
- **Image processing**: sharp (included in pnpm.onlyBuiltDependencies)
- **Rich text**: Lexical editor via `@payloadcms/richtext-lexical`
- **Dev**: `pnpm dev` with hot reload; `payload` CLI for migrations/generation

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

## Learned 2026-04-10 (task: 1529-260410-102822)

- Uses Drizzle ORM
- Uses Payload CMS collections

## Learned 2026-04-18 (architecture: nextjs-payload-auth)

- Security utilities in `src/security/` follow sanitization pattern: `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` — each validates and returns safe strings
- Service classes use constructor injection: `constructor(private store: X, private enrollmentStore: Y, ...)`
- Store classes use `Map<string, T>` for in-memory collections with secondary index maps for lookups
- React drag-and-drop uses `dataTransfer.setData/getData` with `dragstart/dragover/dragleave/drop/dragend` event handlers
- Middleware chain: auth → role-guard → rate-limiter → csrf → request-logger → validation

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Note`, `Quiz`, `QuizAttempt`, `Notification`, `Discussion`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)
- `GET/POST /api/notifications`, `POST /api/notifications/[id]/read`, `POST /api/notifications/read-all` — Notifications with `NotificationSeverity` (info/warning/error)
- `GET /api/dashboard/admin-stats` — Admin statistics
- `GET /api/health` — Health check

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility. Users table extended with `lastLogin` (timestamp) and `permissions` (text array) via migration `20260405_000000_add_users_permissions_lastLogin`.

**Middleware:** `auth-middleware.ts`, `role-guard.ts`, `rate-limiter.ts`, `csrf-middleware.ts`, `request-logger.ts`, `validation.ts`

**Security:** `csrf-token.ts`, `sanitizers.ts` (includes `sanitizeHtml`), `validation-middleware.ts`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationSeverity`, `PayloadGradebookService`, `CourseSearchService`, `Certificate`, `Assignment`, `Submission`

**Database Schema:** `users` (id, email, hash, roles, lastLogin, permissions), `users_sessions`, `media`, `courses`, `modules`, `lessons`, `enrollments`, `notes`, `quizzes`, `quiz_attempts`, `notifications`, `assignments`, `submissions`, `certificates`, `discussions`, `payload_kv`, `payload_locked_documents`

## patterns

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
- **Dual validation systems**: Custom `validation.ts` middleware coexists with Zod schemas in `src/validation/` — unclear which is preferred.

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
| Unit/Integration  | `tests/*.test.ts`                       | In-memory store tests (no Payload dependency) |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Module Mocking**: `vi.mock('payload', ...)` to stub Payload SDK in unit tests (e.g., `tests/progress.test.ts`)
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` (no test step in CI script)
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; no `--coverage` flag in `test:int` script
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **Sanitizers chain** (`src/security/sanitizers.ts`): `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` each return safe strings — reuse this pattern for any new sanitization needs.
- **Constructor injection** (`src/services/*.ts`): Service classes declare `constructor(private store: X, ...)` for dependency injection.
- **Store Map pattern** (`src/auth/session-store.ts`): Uses `Map<string, T>` with secondary index maps for lookups.
- **Drag-and-drop** (`src/components/*/`): Uses `dataTransfer.setData/getData` with `dragstart/dragover/dragleave/drop/dragend` handlers.
- **Middleware chain order**: `auth → role-guard → rate-limiter → csrf → request-logger → validation` (documented in `src/middleware/`).
- **TDD test location**: Tests co-located with source (`src/**/*.test.ts`) or in `tests/int/*.int.spec.ts` for integration specs.

## Improvement Areas

- **Dual auth systems** (`src/auth/user-store.ts` vs `src/auth/auth-service.ts`): SHA-256 vs PBKDF2 hashing — pick one and migrate.
- **Role divergence**: `UserStore.UserRole` and `RbacRole` types are misaligned — should unify under a single role enum.
- **Type casts** (`src/app/(frontend)/dashboard/page.tsx`): Uses `as unknown as` instead of proper type guards — prefer discriminated unions or type predicates.
- **Dual validation** (`src/middleware/validation.ts` vs `src/validation/`): Unclear which to use for new endpoints — establish a convention.
- **N+1 risk** in dashboard: `dashboard/page.tsx` batch-fetches lessons but other pages may not — audit `src/app/api/` for batch patterns.

## Acceptance Criteria

- [ ] All new routes added to `src/app/api/` follow the `withAuth` → Service → Payload pattern
- [ ] New Payload collections added to `src/collections/` with proper TypeScript types
- [ ] Tests use `vi.mock('payload', ...)` for Payload SDK stubs; co-located `*.test.ts` files
- [ ] Sanitization via `src/security/sanitizers.ts` for any user-provided HTML/SQL/URL input
- [ ] Role checks use `role-guard.ts` middleware, not custom `UserStore` role checks
- [ ] No `as unknown as` casts — use proper type guards or Zod schemas from `src/validation/`
- [ ] `pnpm lint` passes before any PR is opened
- [ ] New API routes have corresponding Playwright E2E specs in `tests/e2e/`

{{TASK_CONTEXT}}
