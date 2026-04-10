# Architecture (auto-detected 2026-04-10)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

- `src/app/` — Next.js App Router (frontend routes + Payload admin at `/admin`)
- `src/collections/` — Payload collection configs (Users, Notes as prototype for Lessons)
- `src/components/` — Custom React components
- `src/hooks/` — Hook functions
- `src/middleware/` — Security middleware (rate limiting, role guards)
- `src/auth/` — JWT auth utilities and role-based access control
- `src/security/` — Security utilities
- `src/services/` — Business logic services
- `src/api/` — API route handlers
- `src/routes/` — Route configurations

## Infrastructure

- Docker: `docker-compose.yml` (Node 20-alpine + PostgreSQL)
- CI: `payload migrate && pnpm build` on merge
- Image processing: sharp (listed in `pnpm.onlyBuiltDependencies`)

## Data Flow

1. Client → Next.js App Router (React Server Components)
2. API routes (`/api/<collection>`) → Payload CMS REST API
3. Payload → PostgreSQL via `@payloadcms/db-postgres`
4. Auth: JWT tokens with role claims (`student`, `instructor`, `admin`)

## Domain Model (from README)

```
Organization (tenant)
├── Users (roles: admin, instructor, student)
├── Courses → Modules → Lessons/Quizzes/Assignments
├── Enrollments (student ↔ course, progress tracking)
├── Certificates (auto-generated on completion)
├── Gradebook & Notifications (not yet implemented)
```
