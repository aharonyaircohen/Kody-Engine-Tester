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

# Architecture (auto-detected 2026-04-11)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes (Next.js App Router)
│   └── (payload)/           # Payload admin routes (/admin)
├── collections/             # Payload collection configs
├── globals/                 # Payload globals configs
├── components/              # Custom React components
├── hooks/                   # Hook functions
├── access/                  # Access control functions (RBAC)
├── middleware/               # Express/Payload middleware (auth, rate-limiting)
├── migrations/              # Payload migrations
├── models/                  # Domain models (courses, lessons, enrollments)
├── routes/                  # API route handlers
├── services/                # Business logic services
├── security/                # Security utilities
├── utils/                   # Utility functions
├── validation/               # Input validation schemas
└── payload.config.ts        # Main Payload CMS configuration
```

## Data Flow

1. **Client** → Next.js App Router (React Server Components)
2. **API Layer** → Payload REST/GraphQL API (`/api/<collection>`)
3. **Access Control** → Role guard middleware (student, instructor, admin)
4. **Business Logic** → Services layer
5. **Data Access** → Payload CMS collections with PostgreSQL adapter

## Infrastructure

- **Containerization**: Docker + docker-compose (postgres + payload services)
- **CI**: `payload migrate && pnpm build` on the `ci` script
- **Admin Panel**: Payload CMS admin UI at `/admin`

## Domain Model (LMS)

Organization (tenant) → Users (admin/instructor/student) → Courses → Modules → Lessons/Quizzes/Assignments → Enrollments → Gradebook + Certificates

## Key Dependencies

- `@payloadcms/db-postgres` - PostgreSQL adapter
- `@payloadcms/next` - Next.js integration for Payload
- `@payloadcms/richtext-lexical` - Rich text editor
- `@payloadcms/ui` - Admin UI components
- `@kody-ade/engine` - Kody engine for test generation
- `graphql` - GraphQL API support
- `sharp` - Image processing for media

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

## Service Layer Pattern (src/services/discussions.ts)

Services use constructor dependency injection; return typed interfaces; private stores prefixed with `store`

```typescript
export class DiscussionService {
  constructor(
    private store: DiscussionsStore,
    private enrollmentStore: EnrollmentStore,
    private getUser: (id: string) => Promise<User | undefined>,
    private enrollmentChecker: EnrollmentChecker,
  ) {}
}
```

## Store Pattern (src/collections/certificates.ts)

In-memory stores use `private Map` with interface definitions alongside collection configs

```typescript
export class CertificatesStore {
  private certificates: Map<string, Certificate> = new Map()
  private certificateNumbers: Map<string, string> = new Map()
}
```

## Security Utilities (src/security/sanitizers.ts)

Named export functions for sanitization; return empty string for invalid input; validate before processing

```typescript
export function sanitizeHtml(input: string): string { ... }
export function sanitizeSql(input: string): string { ... }
export function sanitizeUrl(input: string): string { ... }
```

## Utility Function Patterns (src/utils/url-shortener.ts)

Async functions with options objects; JSDoc with @example tags; throw on invalid input

```typescript
export async function generateShortCode(
  url: string,
  options: UrlShortenerOptions = {}
): Promise<ShortCodeResult> {
  if (!url) throw new Error('URL is required')
  ...
}

## domain
## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Assignment`, `Submission`, `Discussion`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`, `Certificate`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (filters: difficulty, tags, sort: relevance/newest/popularity/rating)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `QuizQuestion`, `QuizAttempt`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `Schema`, `SchemaError`

**Domain Models:**

- `Notification` (`src/models/notification.ts`): id, recipient, type, severity (info/warning/error), title, message, link?, isRead, createdAt
- `QuizQuestion`: text, type (multiple-choice/true-false/short-answer), options[], correctAnswer?, points
- `Quiz`: id, title, passingScore, maxAttempts, questions[]
- `QuizAnswer`: questionIndex, answer (string|number)
- `QuizAttempt` (`QuizAttempts` collection): user, quiz, score, passed, answers[], startedAt, completedAt
- `GradeOutput`: score, passed, results[], totalPoints, earnedPoints

**Schema Validation (`src/utils/schema.ts`):** Mini-Zod with `Schema`, `SchemaError`, builder `s.string()/number()/boolean()/array()/object()`, `Infer<T>` type inference

**User Fields:** email, firstName, lastName, displayName, avatar?, bio?, role (admin/editor/viewer), organization?, refreshToken?, tokenExpiresAt?, lastTokenUsedAt?, lastLogin?, permissions? (text[])

**Notification Types:** enrollment, grade, deadline, discussion, announcement (from `Notifications` collection)

**Collections:** Users, Media, Courses, Modules, Lessons, Assignments, Submissions, Discussions, Enrollments, Notes, Quizzes, QuizAttempts, Notifications, Certificates

## patterns
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
- **Validation Middleware** (`src/middleware/validation.ts`): Schema-driven request validation with typed field definitions (`string|number|boolean`), automatic type coercion, and structured `ValidationError` reporting.

### Architectural Layers

```

Route Handlers (src/api/_, src/app/_)
↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
↓
Service Layer (src/services/\*.ts: GradebookService, GradingService)
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

- **Integration**: Vitest 4.0 (`vitest.config.mts`) — `pnpm test:int`
- **E2E**: Playwright 1.58 (`playwright.config.ts`) — `pnpm test:e2e`
- **Runner**: `pnpm test` executes both suites sequentially

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                   |
| E2E               | `tests/e2e/*.spec.ts`                   | Page-object style helpers in `tests/helpers/` |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Test Helpers**: `tests/helpers/login.ts` for auth, `tests/helpers/seedUser.ts` for test data lifecycle
- **Vitest Setup**: Global setup file at `vitest.setup.ts` loaded before test environment

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise
- Playwright reporter outputs HTML traces on first retry

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Test Execution

```

pnpm test → test:int && test:e2e
pnpm test:int → vitest run --config ./vitest.config.mts
pnpm test:e2e → playwright test --config=playwright.config.ts

## Repo Patterns

**Store pattern** — `src/collections/certificates.ts` uses `private Map` with typed interface alongside collection config. Use `getById|create|update|delete|query` methods.

**Service DI pattern** — `src/services/discussions.ts` injects store interfaces in constructor (e.g., `private store: DiscussionsStore`). Private members prefixed with `store`.

**Auth HOC wrapping** — `src/auth/withAuth.ts` wraps route handlers with JWT + RBAC. Use `extractBearerToken` + `checkRole` for auth boundary.

**Result type for errors** — `src/utils/result.ts` provides `Result<T, E>` discriminated union. Prefer over throwing in service methods.

**Validation middleware** — `src/middleware/validation.ts` uses schema-driven validation with `string|number|boolean` field types and structured `ValidationError` reporting.

## Improvement Areas

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) at `src/auth/` coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing. Align on one auth system.
- **Role divergence**: `UserStore.UserRole` uses `'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole` uses `'admin'|'editor'|'viewer'` — no alignment between `src/auth/` and `src/security/`.
- **Type narrowing** — `src/app/(frontend)/dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards. Use type predicates or exhaustive switch statements.
- **N+1 risk** — Dashboard page batch-fetches lessons; other pages may not. Audit `src/services/` for potential N+1 patterns.

## Acceptance Criteria

- [ ] TypeScript compiles without errors (`pnpm tsc --noEmit`)
- [ ] ESLint passes with zero errors (`pnpm lint`)
- [ ] Vitest integration tests pass (`pnpm test:int`)
- [ ] Playwright E2E tests pass (`pnpm test:e2e`)
- [ ] `pnpm build` succeeds without warnings
- [ ] All new code follows naming conventions (PascalCase components, camelCase functions, kebab-case CSS files)
- [ ] Service layer uses constructor DI pattern with typed interfaces
- [ ] Auth boundary uses `withAuth` HOC + `extractBearerToken` + `checkRole`
- [ ] Error handling uses `Result<T, E>` type from `src/utils/result.ts`
- [ ] No `as unknown as` casts introduced in new code

{{TASK_CONTEXT}}
