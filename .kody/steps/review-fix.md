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

# LearnHub LMS Architecture

## Stack

- **Framework**: Next.js 16 App Router + Payload CMS 3.80 (headless)
- **Language**: TypeScript 5.7 (ES2022 target)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Testing**: Vitest 4.0 (integration) + Playwright 1.58 (E2E)
- **Runtime**: Node 18+ / pnpm 9+

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── (frontend)/        # Public/authenticated frontend routes
│   └── (payload)/         # Payload admin routes (/admin)
├── collections/           # Payload collection configs (Course, Lesson, Enrollment, etc.)
├── components/            # Custom React components
├── hooks/                 # Custom React hooks
├── middleware/            # Express-style middleware (rate-limiter)
├── auth/                  # Auth utilities (JWT service, session store, withAuth HOC)
├── utils/                 # Pure utility functions (debounce, retry, flatten, result)
├── services/              # Business logic services
├── api/                   # API route handlers (login, profile, etc.)
├── contexts/              # React contexts
├── validation/            # Zod schemas for input validation
├── security/              # Security utilities (password hashing, RBAC)
├── migrations/            # Payload database migrations
└── payload.config.ts      # Payload CMS configuration
```

## Layer Architecture

**Route Handler** → `src/api/*` → `src/auth/*` (withAuth HOC) → `src/services/*` → `src/collections/*` (Payload)

## Infrastructure

- **Docker**: `docker-compose.yml` (Payload app + PostgreSQL)
- **CI**: `pnpm ci` runs `payload migrate` then `pnpm build`
- **Admin**: Payload admin panel at `/admin`
- **Media**: Sharp for image processing, Payload Media collection

## Data Flow

1. Client → Next.js Route Handler (`src/app/(frontend)/api/`)
2. Auth middleware validates JWT via `src/auth/jwt-service.ts`
3. Service layer (`src/services/`) handles business logic
4. Payload collections (`src/collections/`) manage PostgreSQL via `@payloadcms/db-postgres`

## Key Configs

- `payload.config.ts` — Payload DB, auth, collections, editor (Lexical)
- `vitest.config.mts` — Integration test runner
- `playwright.config.ts` — E2E browser testing

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

## domain

## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`

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

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`

## patterns

## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
  ... (truncated)

## Stage Being Customized

Stage: review-fix

## Repo Patterns

### Auth HOC Pattern — `src/auth/withAuth.ts`

```typescript
export function withAuth(
  handler: (req: NextRequest, context: RouteContext, routeParams?: any) => Promise<Response>,
  options: WithAuthOptions = {},
) {
  return async (req: NextRequest, routeParams?: unknown): Promise<Response> => {
    const token = extractBearerToken(authHeader)
    const result = await authService.verifyAccessToken(token)
    const roleCheck = checkRole(result.user, options.roles)
    return handler(req, { user: result.user }, routeParams)
  }
}
```

### DI Container Pattern — `src/utils/di-container.ts`

```typescript
export function createToken<T>(name: string): Token<T>
container.register<T>(token, factory) // singleton by default
container.registerTransient<T>(token, factory) // new instance each resolve
container.resolve<T>(token) // throws on missing or circular dep
```

### Sanitization Pattern — `src/security/sanitizers.ts`

```typescript
sanitizeHtml(input: string): string     // strips HTML tags + decodes entities
sanitizeSql(input: string): string      // escapes ', ", \, control chars
sanitizeUrl(input: string): string      // rejects javascript:/data:, only http/https
sanitizeObject(obj, schema): Record<string, unknown>  // recursive per-schema
```

### Result Type Pattern — `src/utils/result.ts`

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
// Usage: ok(value), err(error), result.map(), result.match()
```

### Validation Middleware Pattern — `src/middleware/validation.ts`

```typescript
validate(schema: ValidationSchema, data, target: 'body'|'query'|'params'): ValidateResult
createValidationMiddleware(schema)       // returns NextResponse or passes validated data via header
```

### Service Constructor Pattern — `src/services/progress.ts`

```typescript
export class ProgressService {
  constructor(private payload: Payload) {} // concrete Payload injection
  async markLessonComplete(enrollmentId: string, lessonId: string): Promise<void>
  async getProgress(enrollmentId: string): Promise<ProgressResult>
}
```

## Improvement Areas

- **Dual auth coexistence** (`src/auth/user-store.ts:53-58` SHA-256 vs `src/auth/auth-service.ts:45-60` PBKDF2+JWT): New auth code must use `AuthService`/`JwtService` — do not add `UserStore` usage in new features.
- **Role system divergence**: `UserStore.UserRole` ('admin'|'user'|'guest'|'student'|'instructor' at `src/auth/user-store.ts:3`) vs `RbacRole` ('admin'|'editor'|'viewer' at `src/auth/auth-service.ts:6`) — no alignment. Use `checkRole` utility with `RbacRole`.
- **Type narrowing** (`src/app/(frontend)/dashboard/page.tsx:44`): Uses `as unknown as PayloadDoc` casts instead of proper type guards — prefer `Result<T, E>.fromResult()` or explicit type predicates.
- **N+1 risk** (`src/app/(frontend)/dashboard/page.tsx:66-73`): Dashboard batch-fetches lessons but other pages may iterate without `depth` param — use Payload's `depth` or `Querydsl` batching.
- **Service tight coupling** (`src/services/progress.ts:44`): `ProgressService` accepts concrete `Payload` not dep interface — prefer `GradebookServiceDeps<T>` pattern for testability.

## Acceptance Criteria

- [ ] New auth logic uses `AuthService`/`JwtService` (not `UserStore`)
- [ ] Role checks use `RbacRole` ('admin'|'editor'|'viewer') via `checkRole` utility from `src/auth/_auth.ts`
- [ ] HTML/SQL/URL inputs pass through `src/security/sanitizers.ts` functions before storage
- [ ] No `as unknown as` casts in new TypeScript code — use proper type guards or `Result` type
- [ ] Payload collection CRUD goes through typed interfaces, not raw `as any` casts
- [ ] Service constructors accept dep interfaces (e.g., `Payload` injected directly is OK if no alternative)
- [ ] Integration tests use `*.int.spec.ts` suffix and `vi.fn()` mocks for Payload SDK
- [ ] E2E tests use page-object helpers from `tests/helpers/`
- [ ] PostgreSQL schema changes include timestamped migration in `src/migrations/`
- [ ] Unit/integration tests co-located with source (`*.test.ts` or `*.test.tsx`)
- [ ] All `payload.find` / `payload.update` calls include `as CollectionSlug` cast for type safety
- [ ] Error responses use `createError(msg, statusCode)` pattern from `src/auth/auth-service.ts:35-39`

{{TASK_CONTEXT}}
