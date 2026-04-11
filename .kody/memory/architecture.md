# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm 9/10
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Layer Structure

### Routes → API → Services/Collections (Payload CMS)

- `src/app/api/` — Frontend API routes (courses, enrollments, gradebook, notifications, quizzes)
- `src/api/auth/` — Auth API routes (login, logout, register, refresh, profile)
- `src/collections/` — Payload collection configs (Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Users, Media)
- `src/services/` — Business logic services (certificates)
- `src/middleware/` — Auth, CSRF, rate-limiting, role-guard middleware

### Data Flow

```
Client → Next.js Route → Middleware (auth/role/rate-limit) → Payload Local API → PostgreSQL
```

- Payload REST auto-generated at `/api/<collection>`
- Custom GraphQL endpoint at `/api/graphql`
- JWT-based auth with role guard middleware (`student`, `instructor`, `admin`)

## Infrastructure

- **Containerization**: Docker + docker-compose (Node 20-alpine, PostgreSQL latest)
- **CI/CD**: GitHub Actions — `ci` script runs `payload migrate && pnpm build`
- **Dev environment**: `pnpm dev` (Next.js dev server on port 3000)
- **Admin panel**: Payload CMS at `/admin`

## Key Patterns

- JWT auth with `saveToJWT: true` for roles (fast access checks without DB lookup)
- Collection-level + field-level access control with `overrideAccess: false` in Local API
- Transaction safety: always pass `req` to nested operations in hooks
- Sharp for image processing via Payload Media collection
- CSRF protection middleware and rate limiting enabled
