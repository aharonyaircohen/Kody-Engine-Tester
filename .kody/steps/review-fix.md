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

# Architecture (auto-detected 2026-04-18)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18
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

## Infrastructure

- Docker: docker-compose.yml (Node 20-alpine + PostgreSQL)
- CI: `pnpm ci` runs `payload migrate && pnpm build`
- Deployment: Dockerfile for Next.js standalone output

## Key Files

- `src/payload.config.ts` - Payload CMS configuration
- `src/payload-types.ts` - Generated TypeScript types
- `docker-compose.yml` - Local development stack
- `AGENTS.md` - Payload CMS development rules

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

## Learned 2026-04-18 (architecture analysis)

- Service pattern: Classes in `src/services/` use constructor dependency injection (e.g., `DiscussionService` receives `store`, `enrollmentStore`, `getUser`, `enrollmentChecker`)
- Store pattern: `CertificatesStore` in `src/collections/certificates.ts` uses private `Map`-based in-memory storage
- Security utilities: `src/security/sanitizers.ts` exports `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` for input sanitization
- Crypto utilities: `src/utils/url-shortener.ts` uses `crypto.subtle.digest('SHA-256', ...)` for deterministic hashing
- Recursive patterns: Discussion threads use recursive `getThreadDepth` and `buildReplies` with depth limiting (max 3 levels)
- Rich text: `RichTextContent` type imported from `src/collections/Discussions`
- Directory structure: `src/security/`, `src/services/`, `src/validation/` directories exist
- Module system: ESM with `import crypto from 'crypto'` (default import for Node crypto)

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Assignment`, `Discussion`, `Certificate`, `Gradebook`, `Notification`

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

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `NotificationFilter`, `Schema`, `SchemaError`

**Database Schema:**

- `users` table: `id`, `updated_at`, `created_at`, `email`, `reset_password_token`, `reset_password_expiration`, `salt`, `hash`, `login_attempts`, `lock_until`, `lastLogin`, `permissions` (text[])
- `users_sessions`: `_order`, `_parent_id`, `id`, `created_at`, `expires_at`
- `media`: standard Payload media fields (url, filename, mime_type, filesize, dimensions, focal point)
- `payload_kv`, `payload_locked_documents`: Payload internal tables

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Validation Schema**: `src/middleware/validation.ts` defines `FieldDefinition` + `ValidationSchema` for typed request validation at API boundaries.

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
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService)
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
- `validate(schema, data, target)` — schema-driven request validation
- `parseUrl(url, options)` — URL component extraction utility
- Zod schemas in `src/validation/` for input validation at API boundaries

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.

## testing-strategy

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Configuration Details

- **Vitest setup**: `vitest.setup.ts` loaded before tests; environment `jsdom`
- **Vitest include**: `src/**/*.test.ts`, `src/**/*.test.tsx`, `tests/int/**/*.int.spec.ts`
- **Playwright projects**: Chromium only (`channel: 'chromium'`); HTML reporter; `webServer` starts `pnpm dev`

## Additional CI Gates

- `test-ci.yml` runs health check echo and `exit 1` on PR events (placeholder)
- `kody.yml` triggers on `push` to `src/**`, `kody.config.json`, `package.json` changes; concurrent group prevents parallel runs
- Playwright `forbidOnly: !!process.env.CI` blocks `.only()` in CI

## Test Data

- E2E: `tests/helpers/seedUser.ts` creates `testUser` fixture; `login()` helper authenticates via UI
- Integration: `vi.useFakeTimers()` / `vi.useRealTimers()` for async RetryQueue tests

## Example References

- Unit: `src/utils/url-parser.test.ts`, `src/utils/retry-queue.test.ts`
- E2E: `tests/e2e/admin.e2e.spec.ts`, `tests/e2e/frontend.e2e.spec.ts`

## Repo Patterns

- **DI Container** (`src/utils/di-container.ts`): Use `Container.register<T>(token, factory)` with singleton/transient lifecycles. Service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T>`). Example: `DiscussionService` receives `store`, `enrollmentStore`, `getUser`, `enrollmentChecker`.
- **Auth HOC** (`src/auth/withAuth.ts`): Wrap route handlers with JWT validation + RBAC via `withAuth(handler, roles[])`. Extract bearer token with `extractBearerToken(req)`.
- **Repository/Store Pattern**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query`. Use when accessing data that doesn't go through Payload collections directly.
- **Result Type** (`src/utils/result.ts`): Use `Result<T, E>` discriminated union for explicit error handling instead of throwing.
- **Security Sanitizers** (`src/security/sanitizers.ts`): Use `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl` on all user-controlled input before storage or rendering.
- **Crypto** (`src/utils/url-shortener.ts`): Use `crypto.subtle.digest('SHA-256', ...)` for deterministic hashing — NOT truncation or `Math.random()`.
- **Validation Schemas** (`src/validation/`): Define Zod schemas for API boundary validation; use `validate(schema, data, target)` from `src/middleware/validation.ts`.
- **Discussion Threads** (`src/collections/Discussions`): Use `getThreadDepth` and `buildReplies` with max depth of 3 levels.
- **CertificatesStore** (`src/collections/certificates.ts`): Uses private `Map`-based in-memory storage — do not persist directly.

## Improvement Areas

- **Dual Auth Systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) in `src/auth/` — inconsistent password hashing. Avoid adding new code to both systems.
- **Role Divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment. When adding roles, align with RbacRole.
- **N+1 Risk**: Dashboard page batch-fetches lessons but other pages may not. When adding list views with associations, use Payload's `include` or `depth` parameter.
- **Type Narrowing** (`src/pages/dashboard/page.tsx`): Uses `as unknown as` casts rather than proper type guards. Prefer type predicates or exhaustive type narrowing over casts.
- **Missing Eager Loading**: Quiz submission paths may not eager-load `QuizAttempt.answers` before rendering.

## Acceptance Criteria

- [ ] New enum/status values traced through ALL consumers outside the diff
- [ ] Role additions aligned with `RbacRole` allowlist in `src/auth/`
- [ ] User-controlled input passes through `sanitizeHtml`/`sanitizeSql`/`sanitizeUrl` before storage
- [ ] Auth wrapping via `withAuth` on all new API routes
- [ ] No `Math.random()` or string truncation for security-sensitive values — use `crypto.subtle`
- [ ] Discussion threads respect max depth limit (3 levels) in `getThreadDepth`/`buildReplies`
- [ ] Quiz grading uses `QuizGrader` service, not direct collection writes
- [ ] Eager loading specified when fetching associations for loops (N+1 prevention)
- [ ] No `.catch(() => {})` silently swallowing errors in critical paths
- [ ] Type guards used over `as unknown as` casts
- [ ] Tests run with `pnpm vitest` pass after each fix
- [ ] No regression in `pnpm lint` after changes

{{TASK_CONTEXT}}
