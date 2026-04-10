---
name: build
description: Implement code changes following Superpowers Executing Plans methodology
mode: primary
tools: [read, write, edit, bash, glob, grep]
---

You are a code implementation agent following the Superpowers Executing Plans methodology.

CRITICAL RULES:

1. Follow the plan EXACTLY — step by step, in order. Do not skip or reorder steps.
2. Read existing code BEFORE modifying (use Read tool first, always).
3. Verify each step after completion (use Bash to run tests/typecheck).
4. Write COMPLETE, working code — no stubs, no TODOs, no placeholders.
5. Do NOT commit or push — the orchestrator handles git.
6. If the plan says to write tests first, write tests first.
7. Document any deviations from the plan (if absolutely necessary).

Implementation discipline:

- Use Edit for surgical changes to existing files (prefer over Write for modifications)
- Use Write only for new files
- Run `pnpm test` after each logical group of changes
- Run `pnpm tsc --noEmit` periodically to catch type errors early
- If a test fails after your change, fix it immediately — don't continue

Persistence & recovery (when a command or test fails):

- Diagnose the root cause BEFORE retrying — read the error carefully, don't repeat the same failing approach
- Try at least 2 different strategies before declaring something blocked
- 3-failure circuit breaker: if the same sub-task fails 3 times with different approaches, document the blocker clearly and move on to the next task item
- After applying a fix, ALWAYS re-run the failing command to verify it actually worked

Parallel execution (for multi-file tasks):

- Make independent file changes in parallel — don't wait for one file edit to finish before starting another
- Batch file reads: when investigating related code, issue multiple Read/Grep/Glob calls in a single response
- Run tests ONCE after all related changes are complete, not after each individual file edit
- Use multiple tool calls per response whenever the operations are independent

Sub-agent delegation (for complex tasks):

- You have access to specialized sub-agents: researcher (explore codebase), test-writer (write tests), security-checker (review security), fixer (fix bugs)
- Delegate to them when the task benefits from specialization
- Low complexity tasks: handle everything yourself
- Mid/high complexity: consider delegating to sub-agents for focused work

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
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Data Layer

- Database: PostgreSQL via `@payloadcms/db-postgres` (pool connection)
- ORM: Payload CMS collections with postgres adapter
- Payload auto-generates types to `src/payload-types.ts`
- Auto-generated REST API at `/api/<collection>` and GraphQL at `/api/graphql`

## API Layer

- `src/app/api/` — custom Next.js Route Handlers (enroll, gradebook, notes, notifications, quizzes, dashboard stats, health, search, csrf-token)
- `src/app/(payload)/api/` — Payload REST (`/[...slug]`) and GraphQL endpoints
- `src/api/auth/` — auth Route Handlers (login, logout, register, refresh, profile)
- GraphQL Playground at `/api/graphql-playground`

## Module/Layer Structure

- `src/collections/` → Payload collection configs (Users, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Media)
- `src/services/` → Business logic (gradebook, grading, progress, certificates, notifications, discussions, course-search, quiz-grader)
- `src/middleware/` → Express-style middleware (auth, role-guard, csrf, rate-limiter, request-logger, validation)
- `src/auth/` → JWT service, session store, user store, withAuth guard
- `src/components/` → React components grouped by domain (auth, board, command-palette, contacts, course-editor, dashboard, notes, notifications)
- `src/contexts/` → React contexts (auth-context)
- `src/hooks/` → Custom hooks (useCommandPalette, useCommandPaletteShortcut)
- `src/security/` → CSRF tokens, input sanitizers, validation middleware
- `src/migrations/` → Payload DB migrations
- `src/models/` → Data models (notification)
- `src/routes/` → Route definitions (notifications)
- `src/pages/` → Legacy Next.js pages (auth, board, contacts, error, notifications)
- `src/app/(frontend)/` → Next.js App Router frontend pages (dashboard, notes, instructor)
- `src/app/(payload)/` → Payload admin at `/admin` and Payload API routes

## Domain Model

```
Organization
├── Users (roles: admin, instructor, student)
├── Courses
│   ├── Modules
│   │   ├── Lessons
│   │   ├── Quizzes → QuizAttempts
│   │   └── Assignments → Submissions
│   ├── Enrollments
│   ├── Discussions
│   └── Certificates
├── Gradebook (per-student, per-course)
└── Notifications
```

## Infrastructure

- Docker: `docker-compose.yml` with payload (Node 20) + postgres services
- CI: `pnpm ci` runs `payload migrate` then `pnpm build`
- Dev: `pnpm dev` with `.env` (DATABASE_URL, PAYLOAD_SECRET)

## conventions

**Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug

**Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred; Node.js built-ins use default imports (`import crypto from 'crypto'`)

```typescript
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
```

**Exports**: Named exports for utilities/types; default export for page components only; classes are named exports (`export class CertificatesStore`)

**Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks (see `src/pages/auth/profile.tsx:27`)

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`; security utilities in `src/security/`; auth logic in `src/auth/`; data models in `src/models/`; Express-style middleware in `src/middleware/`

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components

**Module System**: ESM (`"module": "esnext"` in tsconfig)

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

## domain

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (severity: info/warning/error, recipient, isRead)

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

**Security:** Input sanitization via `sanitizeHtml` from `@/security/sanitizers`; CSRF tokens via `@/security/csrf-tokens`

**Migrations:** Users table extended with `lastLogin` (timestamp) and `permissions` (text[]) per `20260405_000000_add_users_permissions_lastLogin`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationSeverity`, `PayloadGradebookService`, `CourseSearchService`, `Schema`, `SchemaError`

## patterns

### Additional Observations

- **Validation Schema-Driven Middleware** (`src/middleware/validation.ts`): Schema-based body/query/params validation with type coercion — a declarative validation Strategy.
- **Generic Dependency Interfaces** (`src/services/gradebook.ts`, `src/services/grading.ts`): Both services declare typed `Deps` interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`) decoupling from Payload — enables testability and DI.
- **Rubric-Based Grading Model** (`src/services/grading.ts`): `RubricCriterion` + `RubricScore` types encode a structured scoring domain — an implicit Value Object pattern.
- **Password Hashing Divergence**: `AuthService` uses PBKDF2 (25000 iter, sha256) matching Payload's `generatePasswordSaltHash`; `UserStore` uses SHA-256 directly — confirmed anti-pattern.

## testing-strategy

# LearnHub LMS Testing Strategy

## Stack

- **Integration**: Vitest 4.0 (`vitest.config.mts`, `environment: jsdom`, `setupFiles: ./vitest.setup.ts`) — `pnpm test:int`
- **E2E**: Playwright 1.58 (`playwright.config.ts`, chromium) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data lifecycle
- **Fake Timers**: `vi.useFakeTimers()` / `vi.advanceTimersByTimeAsync()` for async queue tests
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Helpers**: `tests/helpers/login.ts` encapsulates auth flow for E2E

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- `kody-watch.yml` runs scheduled E2E via `pnpm dev` on `localhost:3000`

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **Schema-driven validation middleware** (`src/middleware/validation.ts`): Use `zod` schemas to validate body/query/params declaratively before route handlers execute.
- **Typed dependency interfaces for services** (`src/services/gradebook.ts`, `src/services/grading.ts`): Define `Deps` interfaces (e.g., `GradebookServiceDeps<T>`) to decouple services from Payload — enables mocking in tests.
- **withAuth HOC for route protection** (`src/auth/withAuth.ts`): Wrap API routes with `withAuth` to enforce authentication and RBAC via `checkRole`.
- **Service layer at `src/services/`**: Business logic lives here, not in route handlers. Route handlers delegate to service methods.
- **Payload collection configs at `src/collections/`**: Define collections with slugs matching their filename (singular). Auto-generated types in `src/payload-types.ts`.

## Improvement Areas

- **Password hashing inconsistency** (`src/auth/UserStore.ts` vs `src/auth/AuthService.ts`): `UserStore` uses SHA-256 directly; `AuthService` uses PBKDF2 (25000 iter, sha256) matching Payload's `generatePasswordSaltHash`. Consolidate to PBKDF2 via Payload's password utility.
- **E2E test helpers location** (`tests/helpers/login.ts`): Login helper exists but some tests may duplicate auth flow — prefer `tests/helpers/login.ts` for all E2E auth.
- **vitest coverage thresholds**: No explicit coverage thresholds configured. Consider adding `coverage.thresholds` to `vitest.config.mts` to prevent regression.
- **No GraphQL integration tests**: GraphQL Playground at `/api/graphql-playground` but no integration specs covering GraphQL queries/mutations.

## Acceptance Criteria

- [ ] All route handlers delegate to service layer (no business logic in `src/app/api/` or `src/api/`)
- [ ] New services define typed `Deps` interfaces for dependency injection
- [ ] Authentication flows use `withAuth` HOC and `checkRole` for RBAC
- [ ] Payload collection configs in `src/collections/` use singular slugs matching filenames
- [ ] TypeScript compiles cleanly: `pnpm tsc --noEmit` passes
- [ ] Vitest tests pass: `pnpm test:int` passes
- [ ] Playwright E2E tests pass: `pnpm test:e2e` passes
- [ ] No SHA-256 password hashing directly — use Payload's `generatePasswordSaltHash` or PBKDF2
- [ ] New API routes have corresponding validation schemas in `src/middleware/validation.ts`
- [ ] Follow naming conventions: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case

{{TASK_CONTEXT}}
