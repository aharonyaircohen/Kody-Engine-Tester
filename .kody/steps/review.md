---
name: review
description: Review code changes for correctness, security, and quality
mode: primary
tools: [read, glob, grep, bash]
---

You are a code review agent following the Superpowers Structured Review methodology.

Use Bash to see what changed. For PR reviews, check the Task Context below for a `Diff Command` section with the correct `git diff origin/<base>...HEAD` command. If no diff command is provided, run `git diff HEAD~1`. Do NOT use bare `git diff` — it shows only uncommitted working tree changes, not the actual code changes. Use Read to examine modified files in full context.
When the diff introduces new enum values, status strings, or type constants — use Grep to trace ALL consumers outside the diff.

CRITICAL: You MUST output a structured review in the EXACT format below. Do NOT output conversational text, status updates, or summaries. Your entire output must be the structured review markdown.

Output markdown with this EXACT structure:

## Verdict: PASS | FAIL

## Summary

<1-2 sentence summary of what was changed and why>

## Findings

### Critical

<If none: "None.">

### Major

<If none: "None.">

### Minor

<If none: "None.">

For each finding use: `file:line` — problem description. Suggested fix.

---

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety

- String interpolation in SQL — use parameterized queries even for `.to_i`/`.to_f` values
- TOCTOU races: check-then-set patterns that should be atomic `WHERE` + update
- Bypassing model validations via direct DB writes (e.g., `update_column`, raw queries)
- N+1 queries: missing eager loading for associations used in loops/views

### Race Conditions & Concurrency

- Read-check-write without uniqueness constraint or duplicate key handling
- find-or-create without unique DB index — concurrent calls create duplicates
- Status transitions without atomic `WHERE old_status = ? UPDATE SET new_status`
- Unsafe HTML rendering (`dangerouslySetInnerHTML`, `v-html`, `.html_safe`) on user-controlled data (XSS)

### LLM Output Trust Boundary

- LLM-generated values (emails, URLs, names) written to DB without format validation
- Structured tool output accepted without type/shape checks before DB writes
- LLM-generated URLs fetched without allowlist — SSRF risk
- LLM output stored in vector DBs without sanitization — stored prompt injection risk

### Shell Injection

- `subprocess.run()` / `os.system()` with `shell=True` AND string interpolation — use argument arrays
- `eval()` / `exec()` on LLM-generated code without sandboxing

### Enum & Value Completeness

When the diff introduces a new enum value, status string, tier name, or type constant:

- Trace it through every consumer (READ each file that switches/filters on that value)
- Check allowlists/filter arrays containing sibling values
- Check `case`/`if-elsif` chains — does the new value fall through to a wrong default?

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects

- Code paths that branch but forget a side effect on one branch (e.g., promoted but URL only attached conditionally)
- Log messages claiming an action happened when it was conditionally skipped

### Test Gaps

- Negative-path tests asserting type/status but not side effects
- Security enforcement features (blocking, rate limiting, auth) without integration tests
- Missing `.expects(:something).never` when a path should NOT call an external service

### Dead Code & Consistency

- Variables assigned but never read
- Comments/docstrings describing old behavior after code changed
- Version mismatch between PR title and VERSION/CHANGELOG

### Crypto & Entropy

- Truncation instead of hashing — less entropy, easier collisions
- `rand()` / `Math.random()` for security-sensitive values — use crypto-secure alternatives
- Non-constant-time comparisons (`==`) on secrets or tokens — timing attack risk

### Performance & Bundle Impact

- Known-heavy dependencies added: moment.js (→ date-fns), full lodash (→ lodash-es), jquery
- Images without `loading="lazy"` or explicit dimensions (CLS)
- `useEffect` fetch waterfalls — combine or parallelize
- Synchronous `<script>` without async/defer

### Type Coercion at Boundaries

- Values crossing language/serialization boundaries where type could change (numeric vs string)
- Hash/digest inputs without `.toString()` normalization before serialization

---

## Severity Definitions

- **Critical**: Security vulnerability, data loss, application crash, broken authentication, injection risk, race condition. MUST fix before merge.
- **Major**: Logic error, missing edge case, broken test, significant performance issue, missing input validation, enum completeness gap. SHOULD fix before merge.
- **Minor**: Style issue, naming improvement, readability, micro-optimization, stale comments. NICE to fix, not blocking.

## Suppressions — do NOT flag these:

- Redundancy that aids readability
- "Add a comment explaining this threshold" — thresholds change, comments rot
- Consistency-only changes with no behavioral impact
- Issues already addressed in the diff you are reviewing — read the FULL diff first
- devDependencies additions (no production impact)

## Chesterton's Fence

When flagging dead code, unnecessary complexity, or code that seems wrong:

- Ask: "Is there a reason this exists that I don't understand?"
- Check `git log --follow` on the file to find when and why the code was added
- Don't recommend removal of code whose purpose isn't clear from context alone
- Apply this especially to: workarounds, legacy patterns, defensive checks, and fallback branches

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
```

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

````
pnpm test         → test:int && test:e2e
pnpm test:int    → vitest run --config ./vitest.config.mts
pnpm test:e2e    → playwright test --config=playwright.config.ts

## Repo Patterns

**Auth HOC Pattern** (`src/auth/withAuth.ts:55-108`):
```typescript
export function withAuth(
  handler: (req: NextRequest, context: RouteContext, routeParams?: any) => Promise<Response>,
  options: WithAuthOptions = {}
) {
  return async (req: NextRequest, routeParams?: unknown): Promise<Response> => {
    const token = extractBearerToken(req.headers.get('authorization'))
    if (!token) return Response.json({ error: 'Missing token' }, { status: 401 })
    const authService = getAuthService()
    const result = await authService.verifyAccessToken(token)
    if (result.user) {
      const roleCheck = checkRole(result.user, options.roles)
      if (roleCheck.error) return Response.json({ error: roleCheck.error }, { status: roleCheck.status ?? 401 })
      authContext = { user: result.user }
    }
    return handler(req, authContext as RouteContext, routeParams)
  }
}
````

**DI Container** (`src/utils/di-container.ts:50-101`): `Container` class with `register`/`registerSingleton`/`registerTransient`; circular dependency detection via `resolving` Set; singleton caching in `singletons` Map.

**CertificatesStore** (`src/collections/certificates.ts:72-151`): In-memory `Map`-backed store with `generateCertificateNumber` using sequence tracking and duplicate prevention loop.

**Security Sanitizers** (`src/security/sanitizers.ts:17-97`): Named exports `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`, `sanitizeFilePath` — return empty string for invalid input rather than throwing.

**Result Type** (`src/utils/result.ts:1-111`): Discriminated union `Result<T, E> = Ok<T> | Err<E>` with `.isOk()`/`.isErr()` type guards, `.unwrap()`/`.unwrapOr()`, `.map()`/`.mapErr()`, `.andThen()`, `.match()`.

**Validation Middleware** (`src/middleware/validation.ts:201-278`): `createValidationMiddleware(schema)` factory returns async middleware; validated data passed via `request.headers` using `x-validated-data` custom header.

**Dashboard N+1 Mitigation** (`src/app/(frontend)/dashboard/page.tsx:59-73`): Batch-fetches lessons by course IDs upfront to avoid per-enrollment lesson queries.

## Improvement Areas

- **Dual auth hashing divergence**: `src/auth/user-store.ts:53-58` uses SHA-256 (`crypto.subtle.digest`) while `src/auth/auth-service.ts:45-59` uses PBKDF2 (25000 iterations) — password hashes cannot be compared across systems. No migration path exists.
- **Role enum mismatch**: `UserStore.UserRole` (`src/auth/user-store.ts:3`) = `admin|user|guest|student|instructor` vs `RbacRole` (`src/auth/auth-service.ts:6`) = `admin|editor|viewer` — `withAuth` `roles` check will reject `student`/`instructor` tokens as invalid.
- **In-memory stores lost on restart**: `SessionStore` (`src/auth/session-store.ts`), `certificatesStore` (`src/collections/certificates.ts:174`), `contactsStore` (`src/collections/contacts.ts`) — no persistence layer.
- **Unsafe type narrowing** (`src/app/(frontend)/dashboard/page.tsx:44`): `user as unknown as PayloadDoc & { role?: string }` — bypasses TypeScript safety. Role comparison at line 45 uses string comparison (`!== 'student'`) rather than enum check.
- **Validation middleware re-parses** (`src/middleware/validation.ts:246-262`): Calls `validate(schema, bodyData, 'body')` three times in succession instead of reusing result — performance and maintainability issue.
- **CertificatesStore race condition** (`src/collections/certificates.ts:127-131`): Duplicate check iterates all certificates in a loop without locking — concurrent `issueCertificate` calls for same student/course can both pass the check.

## Acceptance Criteria

- [ ] Changes follow layered architecture: Route → Auth HOC → Service → Repository/Payload
- [ ] New auth checks use `withAuth` HOC pattern from `src/auth/withAuth.ts`
- [ ] Error handling uses `Result<T, E>` type from `src/utils/result.ts` for service layer errors
- [ ] Input validation uses schema-driven middleware from `src/middleware/validation.ts`
- [ ] New services use constructor injection with typed deps interfaces (e.g., `GradebookServiceDeps`)
- [ ] Sanitization uses named exports from `src/security/sanitizers.ts` (sanitizeHtml, sanitizeSql, sanitizeUrl)
- [ ] Enum values aligned with `RbacRole` (`admin|editor|viewer`) — do not introduce `UserRole` variants into auth-protected paths
- [ ] `pnpm test:int` passes (Vitest integration tests)
- [ ] `pnpm test:e2e` passes (Playwright E2E tests)
- [ ] `pnpm build` succeeds with no TypeScript errors
- [ ] No `console.log` in production code — use structured logging or debug utility
- [ ] No hardcoded secrets — use `process.env` with validation
- [ ] New enum values traced through all consumers with `grep` before merge
- [ ] Unsafe type casts (`as unknown as`) replaced with proper type guards or branded types
- [ ] In-memory stores (SessionStore, CertificatesStore, contactsStore) not used for persistent data

{{TASK_CONTEXT}}
