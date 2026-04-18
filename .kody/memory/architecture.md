# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1 (App Router)
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (int), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

```
Request → Middleware (auth, rate-limiter, csrf, role-guard) → API Route (src/app/api/*, src/api/*)
  → Payload Collections (src/collections/*) → PostgreSQL
```

- **api/** — Auth API controllers (login, register, logout, refresh, profile)
- **app/api/** — Frontend API routes (courses, enroll, gradebook, health, notes, notifications, quizzes)
- **auth/** — JWT service, auth service, session store, user store, withAuth decorator
- **collections/** — Payload CMS schemas (Users, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Media, Discussions)
- **middleware/** — Express-style middleware: auth-middleware, csrf-middleware, rate-limiter, role-guard, request-logger, validation
- **security/** — CSRF tokens, sanitizers, validation-middleware
- **services/** — Business logic (certificates service)
- **models/** — Data models (notification model)
- **hooks/** — React hooks (useCommandPalette, useCommandPaletteShortcut)
- **app/(frontend)/** — Frontend pages (dashboard, instructor, notes)
- **app/(payload)/admin/** — Payload admin panel

## Data Flow

1. Client → Next.js middleware chain (auth-middleware, csrf-middleware, rate-limiter)
2. API routes in `src/app/api/*` handle REST operations
3. Payload collections provide typed schemas and access control
4. PostgreSQL persists data via `@payloadcms/db-postgres` adapter
5. JWT tokens issued via `auth/jwt-service.ts`; sessions managed via `auth/session-store.ts`

## Infrastructure

- **Docker**: docker-compose.yml with payload (Node 20 Alpine) + postgres services
- **CI**: `payload migrate && pnpm build` on CI
- **Sharp**: Image processing via `@payloadcms/ui` Media collection

## Key Conventions

- Collections use Payload's `relationship` field for associations
- Auth uses JWT with role guard middleware (`student`, `instructor`, `admin`)
- Lexical editor for rich text content
- Timestamps auto-managed by Payload (`createdAt`, `updatedAt`)
- Soft deletes preferred for audit trail
- Tests: vitest for unit/integration, Playwright for e2e (chromium only)
