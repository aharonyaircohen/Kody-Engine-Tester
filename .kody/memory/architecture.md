# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

### Frontend Routes (`src/app/(frontend)/`)

- Landing page at `/`
- Dashboard at `/dashboard`
- Notes CRUD at `/notes`, `/notes/create`, `/notes/[id]`, `/notes/edit/[id]`
- Instructor course editor at `/instructor/courses/[id]/edit`

### API Routes (`src/app/api/`)

Custom REST endpoints layered over Payload:

- `src/app/api/auth/*` — login, register, logout, refresh, profile (src/api/auth/)
- `src/app/api/courses/search/route.ts` — course search
- `src/app/api/enroll/route.ts` — enrollment
- `src/app/api/gradebook/*` — gradebook endpoints
- `src/app/api/notifications/*` — notifications CRUD
- `src/app/api/quizzes/[id]/*` — quiz submission and attempts
- `src/app/api/dashboard/admin-stats/route.ts` — admin statistics
- `src/app/api/health/route.ts` — health check

### Payload Admin (`src/app/(payload)/`)

- Admin panel at `/admin`
- GraphQL endpoint at `/api/graphql`
- REST API at `/api/[...slug]`

### Auth Layer (`src/auth/`)

- `auth-service.ts` — authentication logic, RBAC roles (admin, editor, viewer)
- `jwt-service.ts` — JWT token generation/verification
- `session-store.ts` — server-side session management
- `_auth.ts` — role hierarchy and authorization helpers

### Middleware (`src/middleware/`)

- `auth-middleware.ts` — JWT validation
- `role-guard.ts` — role-based access control
- `csrf-middleware.ts` — CSRF protection
- `rate-limiter.ts` — request rate limiting
- `request-logger.ts` — request logging
- `validation.ts` — input validation

### Collections (`src/collections/`)

Payload CMS collections with full domain model:

- **Users** — auth-enabled, roles field (admin/editor/viewer)
- **Media** — file uploads with sharp processing
- **Courses, Modules, Lessons** — curriculum structure
- **Enrollments** — student-course relationship with progress
- **Certificates** — auto-generated on completion
- **Assignments, Submissions** — homework with rubric grading
- **Quizzes, QuizAttempts** — quiz engine with attempt tracking
- **Discussions** — threaded per-lesson
- **Notifications** — user notifications
- **Notes** — prototype lesson content

## Data Flow

```
Client → Next.js App Router (src/app/)
  ├→ (frontend)/* → Server Components → Payload Local API → PostgreSQL
  ├→ /api/* → Custom Route Handlers → Auth Service → Payload Collections
  └→ /admin/* → Payload Admin UI → Payload REST/GraphQL → PostgreSQL

Authentication: JWT Bearer token → jwt-service.ts → role-guard.ts → collection access control
```

## Infrastructure

- **Database**: PostgreSQL via `@payloadcms/db-postgres` (pool connection)
- **Image Processing**: sharp
- **Rich Text**: Lexical editor (`@payloadcms/richtext-lexical`)
- **Docker**: docker-compose.yml with Payload + PostgreSQL services
- **CI**: `payload migrate && pnpm build` on CI trigger
- **Migrations**: Payload migrations in `src/migrations/`
- **Deployment**: Standalone Next.js Dockerfile

## Key Files

- `src/payload.config.ts` — Payload CMS configuration
- `src/auth/auth-service.ts` — RBAC authentication service
- `src/middleware/role-guard.ts` — role-based middleware
- `AGENTS.md` — Payload CMS development rules
