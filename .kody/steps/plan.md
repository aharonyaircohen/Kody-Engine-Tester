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

## Data Flow

```
Client → Next.js App Router (RSC) → Payload REST API (/api/<collection>)
                                         ↓
                                   PostgreSQL (via @payloadcms/db-postgres)
```

- REST endpoints auto-generated by Payload at `/api/<collection>`
- JWT-based auth with role guard middleware (`student`, `instructor`, `admin`)
- Rich text via Lexical editor; media processing via sharp

## Module/Layer Structure

```
src/
├── app/
│   ├── (frontend)/           # Frontend routes (Next.js App Router)
│   └── (payload)/            # Payload admin routes (/admin)
├── collections/              # Payload collection configs (data schema)
├── access/                   # Access control functions per collection
├── hooks/                    # Hook functions (lifecycle: beforeChange, etc.)
├── globals/                  # Global configs
├── components/               # Custom React components
├── middleware/               # Auth rate-limiting, role guards
├── services/                 # Business logic services
└── payload.config.ts         # Main Payload configuration
```

## Domain Model

```
Organization (tenant)
├── Users (roles: admin, instructor, student)
├── Courses
│   ├── Modules → Lessons, Quizzes, Assignments
│   ├── Enrollments (student ↔ course, progress)
│   └── Discussions (threaded, per-lesson)
├── Certificates
├── Gradebook
└── Notifications
```

## Infrastructure

- **Container**: Docker Compose (payload + postgres)
- **CI**: `pnpm ci` runs `payload migrate && pnpm build`
- **Dev**: `pnpm dev` with Next.js dev server on port 3000
- **Admin**: Payload CMS admin panel at `/admin`
- **Media**: File uploads via Payload Media collection (sharp processing)

## Key Dependencies

- `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/ui`, `@payloadcms/richtext-lexical`
- `next`: 16.2.1, `react`: 19.2.4, `payload`: 3.80.0
- `sharp` (image processing), `graphql` (API exposure)

## conventions

### Learned 2026-04-18 (task: conventions update)

- CSS modules: `import styles from './ModuleList.module.css'`
- Service classes: `constructor(private store: DiscussionsStore, ...)` with dependency injection
- JSDoc comments with `@example` in utility files
- `CollectionConfig`, `CollectionSlug` from Payload; collection slugs are singular (`'certificates'`)
- Sanitizers in `src/security/sanitizers.ts` with HTML entity decoding map
- ProtectedRoute wrapper pattern for page-level auth
- Bearer token auth: `Authorization: \`Bearer ${accessToken}\``
- Collections export both `CollectionConfig` and interfaces (`export interface Certificate`)

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).
- **Builder Pattern** (`src/utils/schema.ts`): Mini-Zod with fluent chainable API (`s.string().optional()`, `s.object({}).default()`), type inference via `_type` phantom property.

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Context Provider** (`src/contexts/auth-context.tsx`): React Context + `AuthProvider` for client-side auth state with token refresh scheduling via `scheduleRefresh`.
- **Custom Hooks** (`src/hooks/useCommandPalette.ts`, `src/hooks/useFormValidation.ts`): Reusable stateful logic abstractions with localStorage persistence.
- **Sanitizer Layer** (`src/security/sanitizers.ts`): HTML, SQL, URL, filepath sanitizers applied via `sanitizeObject` recursive traversal.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store. Same pattern across `NotificationsStore`, `EnrollmentStore`, `DiscussionsStore`, `LessonStore`, `NotesStore`, `ModuleStore`, `CertificatesStore`, `TaskStore`.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.
- **Validator Composition** (`src/validation/validators.ts`, `compose.ts`): Composable validator functions returning `ValidatorResult = { valid: true } | { valid: false; error: string }`; `compose()` chains validators short-circuiting on first failure.
- **Rate Limiter Strategy** (`src/middleware/rate-limiter.ts`): `SlidingWindowRateLimiter` with configurable key extraction via `byIp`, `byApiKey` strategy functions.
- **Role Guard** (`src/middleware/role-guard.ts`): `requireRole(...roles)` decorator-style guard for route protection.

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService, DiscussionService)
    ↓
Repository Layer (Payload Collections, ContactStore, NotificationsStore, DiscussionsStore, EnrollmentStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Module Boundaries

- **Entry points**: API routes, Next.js pages
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`) decouple services from Payload
- **Validation boundary**: `ValidateConfig` + `ValidatedRequest` (`src/security/validation-middleware.ts`) vs `ValidationSchema` (`src/middleware/validation.ts`) — two overlapping validation systems

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- `SlidingWindowRateLimiter` — rate limiting with configurable window/limit
- `s.string()|number()|boolean()|object()|array()` — mini-Zod schema builder
- `compose(...validators)` — validator composition
- `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`, `sanitizeFilePath` — security sanitizers
- Zod schemas in `src/validation/` for input validation at API boundaries

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
- **Dual validation systems**: `src/middleware/validation.ts` (field-based) vs `src/utils/schema.ts` (mini-Zod) vs `src/validation/validators.ts` (composable validators) — three overlapping approaches.
- **Scattered security**: CSRF in both `src/security/csrf-token.ts` and `src/middleware/csrf-middleware.ts`; sanitizers in `src/security/sanitizers.ts` separate from validation layer.

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

## Kody Engine Test Suite

The project includes a dedicated test suite runner for the Kody pipeline:

| File                             | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `tests/helpers/login.ts`         | E2E authentication helper                            |
| `tests/helpers/seedUser.ts`      | User fixture setup/teardown                          |
| `tests/e2e/admin.e2e.spec.ts`    | Admin panel navigation (dashboard, list, edit views) |
| `tests/e2e/frontend.e2e.spec.ts` | Frontend homepage smoke test                         |

Kody workflow (`kody.yml`) triggers on: issue comments (`@kody`), PR reviews, workflow completion, push to `main/dev`, and scheduled cron (`*/30 * * * *`).

## Repo Patterns

- **HOC Auth Wrapper**: `src/auth/withAuth.ts:55` — `withAuth(handler, { roles: ['admin'] })` pattern wraps route handlers; handler receives `(req, context, routeParams)` where `context.user` is the authenticated user.
- **Result Type for Error Handling**: `src/utils/result.ts:14-49` — `Ok<T>` and `Err<T, E>` classes with `isOk()`, `isErr()`, `unwrap()`, `map()`, `andThen()`, `match()`; use `ok(value)` / `err(error)` factory functions.
- **Repository Store Pattern**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query`; replicated in `NotificationsStore`, `EnrollmentStore`, `DiscussionsStore`, `LessonStore`, `NotesStore`, `ModuleStore`, `CertificatesStore`, `TaskStore`.
- **DI Container Singleton**: `src/utils/di-container.ts:61-70` — `Container.register<T>(token, factory)` defaults to singleton lifecycle; use `registerTransient` for new instances per resolve.
- **Service Constructor DI**: `src/services/progress.ts` — `constructor(private store: EnrollmentStore, ...)` pattern; services receive store interfaces, not concrete implementations.

## Improvement Areas

- **Dual Auth Systems**: `src/auth/user-store.ts:27` (SHA-256, in-memory) vs `src/auth/auth-service.ts` (PBKDF2, JWT) — `UserStore` is never used in production routes; consolidate to `AuthService`.
- **Role Divergence**: `UserStore.UserRole` (`'admin'|'user'|'guest'|'student'|'instructor'`) vs `RbacRole` (`'admin'|'editor'|'viewer'`) — `src/auth/user-store.ts:3` vs `src/auth/_auth.ts`; align roles or remove dead `UserStore`.
- **Type Casts Instead of Guards**: `src/app/(frontend)/dashboard/page.tsx:44` uses `user as unknown as PayloadDoc & { role?: string }` instead of proper type narrowing; define shared types in `src/payload-types.ts`.
- **Triple Validation**: `src/middleware/validation.ts` (field-based) + `src/utils/schema.ts` (mini-Zod builder) + `src/validation/validators.ts` (composable) — choose one and migrate; keep `src/validation/validators.ts` as it has `compose()` chain.
- **Scattered CSRF**: `src/security/csrf-token.ts` and `src/middleware/csrf-middleware.ts` both implement CSRF; consolidate into `src/middleware/csrf-middleware.ts` only.

## Acceptance Criteria

- [ ] All new routes use `withAuth` HOC from `src/auth/withAuth.ts` — never implement inline JWT validation
- [ ] Service layer follows DI pattern: constructor accepts store interfaces, not concrete Payload instances
- [ ] Error handling uses `Result<T, E>` from `src/utils/result.ts` for explicit error paths
- [ ] Collection slugs are singular (e.g., `'certificate'`, not `'certificates'`)
- [ ] CSS modules use `import styles from './ComponentName.module.css'` convention
- [ ] API routes return `NextResponse.json()` with typed payloads
- [ ] Tests use `vi.fn()` mocks for Payload SDK; fixtures use `seedTestUser()` pattern from `tests/helpers/`
- [ ] No `as unknown as` casts — use proper type guards or shared types from `src/payload-types.ts`
- [ ] `pnpm test:int` passes for integration tests; `pnpm test:e2e` passes for E2E
- [ ] No inline styles in React components — use CSS modules or component library

{{TASK_CONTEXT}}
