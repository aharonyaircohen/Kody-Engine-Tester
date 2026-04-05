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
- Testing: vitest 4.0.18 (int), playwright 1.58.2 (e2e)
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
├── globals/                 # Payload global configs
├── components/              # Custom React components
├── hooks/                   # React hook functions
├── access/                  # Payload access control functions
├── middleware/              # Next.js middleware (auth, rate limiting)
├── services/                # Business logic services
├── api/                     # API route handlers
├── auth/                    # Authentication utilities
├── security/                # Security utilities (rate limiting)
├── validation/              # Input validation schemas
└── payload.config.ts        # Main Payload CMS config
```

## Data Flow

```
Client → Next.js App Router → Middleware (auth, rate limit)
       → Payload REST API (/api/<collection>)
       → Payload Collections → PostgreSQL (via @payloadcms/db-postgres)
```

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

- **Container**: Docker + docker-compose (payload + postgres services)
- **CI**: `pnpm ci` runs `payload migrate && pnpm build`
- **Deployment**: Multi-stage Dockerfile (deps → builder → runner), standalone output configured

## Key Conventions

- JWT-based auth with role guard middleware (`student`, `instructor`, `admin`)
- Rich text via Lexical editor (`@payloadcms/richtext-lexical`)
- Media handling via Payload Media collection (sharp for image processing)
- Local API operations pass `req` for transaction safety
- Type generation: `pnpm generate:types` after schema changes
- Import maps: `pnpm generate:importmap` after component changes
- Soft deletes preferred over hard deletes for audit trail

## conventions

# LearnHub Coding Conventions

**Naming**: Components/Types → PascalCase; functions/utils → camelCase; files → kebab-case (`.module.css`); collections → singular slug

**Imports**: Use `import type` for types; path alias `@/*` for internal modules; named imports preferred

```typescript
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
```

**Exports**: Named exports for utilities/types/classes; default export for page components only

**Error Handling**: async/await with try-catch; `.catch(() => {})` for non-critical fallbacks (see `src/pages/auth/profile.tsx:27`)

**File Organization**: Single-responsibility utils in `src/utils/`; business logic in `src/services/`; Payload configs in `src/collections/`; React components in `src/components/`

**Style**: Prettier singleQuote, trailingComma=all, printWidth=100, semi=false; ESLint strict TypeScript; `'use client'` directive on all client components

**CSS Modules**: Import as camelCase alias: `import styles from './ModuleList.module.css'`

**Security**: Sanitization utilities in `src/security/sanitizers.ts` (sanitizeHtml, sanitizeSql, sanitizeUrl)

**Stores & Services**: In-memory stores (e.g., `CertificatesStore`, `DiscussionsStore`) in `src/collections/`; service classes with dependency injection in `src/services/`

**Payload Collections**: Use `as CollectionSlug` cast on relationTo fields; collection slugs are singular

**API Auth**: Pass Bearer token in Authorization header; retrieve from localStorage via `localStorage.getItem('auth_access_token')`

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (severity: info/warning/error, isRead, link)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Note by ID with HTML sanitization via `sanitizeHtml`
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (sort: relevance/newest/popularity/rating, difficulty: beginner/intermediate/advanced)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Database Schema:** `users` (id, email, hash, salt, reset_password_token, login_attempts, lock_until, lastLogin, permissions), `users_sessions`, `media`, `payload_kv`, `payload_locked_documents`

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationFilter`, `NotificationSeverity`

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `src/middleware/validation.ts` implement Express-style chainable middleware for Next.js.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.
- **Validation Strategy**: `src/middleware/validation.ts` validates body/query/params against typed `FieldDefinition` schemas with type coercion (`string`, `number`, `boolean`) and per-field error accumulation.

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
- `validate(schema, data, target)` from `validation.ts` — field-level validation with type coercion
- `parseUrl(url, options)` from `src/utils/url-parser.ts` — protocol/host/path/query/fragment extraction
- Zod schemas in `src/validation/` for input validation at API boundaries

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.

## testing-strategy

## Organization

| Type              | Location                                | Pattern                                       |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Unit/Integration  | `src/**/*.test.ts`, `src/**/*.test.tsx` | Co-located with source                        |
| Integration Specs | `tests/int/**/*.int.spec.ts`            | Dedicated integration folder                  |
| E2E               | `tests/e2e/*.spec.ts`                   | Helpers in `tests/helpers/` (login, seedUser) |

## Patterns

- **Mocks**: `vi.fn()` + `mockResolvedValue` / `mockRejectedValue` for Payload SDK stubs
- **Fixtures**: `seedTestUser()` / `cleanupTestUser()` pattern for E2E test data
- **Fake Timers**: `vi.useFakeTimers()` for async queue tests (e.g., `RetryQueue`)
- **Browser Context**: Shared `Page` instance via `browser.newContext()` in `beforeAll`
- **Vitest include pattern**: `['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts', 'tests/int/**/*.int.spec.ts']`

## CI Quality Gates

- `pnpm ci` runs `payload migrate` → `pnpm build` → `pnpm test`
- Playwright `forbidOnly: true` prevents committed `.only()` tests
- Retries enabled on CI (2x) to reduce flaky failure noise

## Coverage

- No explicit threshold configured; vitest run passes `--coverage` implicitly
- Example coverage: `CourseSearchService` tested via mocked Payload find calls

## Repo Patterns

- **Result type for error handling**: Use `Result<T, E>` from `src/utils/result.ts` — discriminated union with `.isOk`/`.isErr` checks instead of throwing.
- **HOC auth wrapper**: `src/auth/withAuth.ts` — wrap route handlers with `withAuth(handler, 'editor')` to enforce RBAC.
- **DI container registration**: `src/utils/di-container.ts` — use `container.register(token, factory)` with singleton/transient lifecycle; inject via typed dep interfaces (e.g., `GradebookServiceDeps`).
- **Validation middleware**: `src/middleware/validation.ts` — use `validate(schema, data, target)` with `FieldDefinition` schemas; don't validate manually in route handlers.
- **Repository store pattern**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — follow this interface for new stores.
- **Payload collection slugs**: Always singular (`user`, `course`) and cast with `as CollectionSlug` on `relationTo` fields.

## Improvement Areas

- **`src/auth/` dual auth inconsistency**: `UserStore` (SHA-256) vs `AuthService` (PBKDF2+JWT) — password hashing is inconsistent; consolidate on one approach.
- **`src/pages/auth/profile.tsx:27`**: Uses `.catch(() => {})` silent swallow — replace with proper error logging or Result-type handling.
- **`dashboard/page.tsx`**: Uses `as unknown as` casts instead of type guards — introduces runtime risk; refactor to proper type narrowing.
- **N+1 risk in dashboard**: Dashboard batch-fetches lessons but other pages may iterate without batching — audit `src/app/(frontend)/` pages for batch-loading opportunities.
- **Role divergence**: `UserStore.UserRole` ('admin'|'user'|'guest'|'student'|'instructor') vs `RbacRole` ('admin'|'editor'|'viewer') — no alignment; establish a single role enum.

## Acceptance Criteria

- [ ] All Critical/Major review findings are fixed with minimal surgical edits
- [ ] Tests pass after each individual fix (run `pnpm test` or `pnpm test:int` as appropriate)
- [ ] No `as unknown as` casts remain in modified files
- [ ] Error handling uses Result type or proper try-catch with logging (no silent `.catch(() => {})`)
- [ ] Auth flow uses single consistent system (prefer `AuthService` + `JwtService`)
- [ ] Role checks align with `RbacRole` enum (`'admin'|'editor'|'viewer'`)
- [ ] New services registered in DI container with proper lifecycle (singleton/transient)
- [ ] Payload collection relationTo fields use `as CollectionSlug` cast
- [ ] Modified files follow naming conventions (PascalCase components, camelCase utils, kebab-case CSS modules)
- [ ] CI pipeline (`pnpm ci`) passes after all fixes applied

{{TASK_CONTEXT}}
