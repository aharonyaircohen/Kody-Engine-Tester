# Architecture (auto-detected 2026-04-04, updated 2026-04-18)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Package manager: pnpm
- Module system: ESM
- Database: PostgreSQL via @payloadcms/db-postgres
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Domain Model (LMS)

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

## Collections (src/collections/)

Core Payload CMS collection configs: Assignments, Certificates, Courses, Discussions, Enrollments, EnrollmentStore, Lessons, Media, Modules, Notifications, NotificationsStore, Notes, QuizAttempts, Quizzes, Submissions, Tasks, Users

Custom collections extend Payload's CollectionConfig with fields, hooks, and access control.

## Module/Layer Structure

### API Layer (src/app/api/)

- Payload REST: `src/app/(payload)/api/[...slug]/route.ts`
- Custom endpoints: `/api/courses/search`, `/api/enroll`, `/api/gradebook`, `/api/health`, `/api/notes`, `/api/notifications`, `/api/quizzes/[id]/submit`, `/api/quizzes/[id]/attempts`
- GraphQL: `src/app/(payload)/api/graphql/route.ts`
- Route handler pattern: `src/app/api/<resource>/route.ts` → `src/services/<resource>.ts`

### Middleware (src/middleware/)

- `auth-middleware.ts` — JWT validation
- `role-guard.ts` — Role-based access control (student, instructor, admin)
- `rate-limiter.ts` — Request rate limiting
- `csrf-middleware.ts` — CSRF protection
- `request-logger.ts` — Request logging

### Services (src/services/)

Business logic layer — called by API routes, wrap Payload Local API with domain logic.

### Payload Admin (src/app/(payload)/)

- Admin UI: `src/app/(payload)/admin/[[...segments]]/page.tsx`
- Custom SCSS: `src/app/(payload)/custom.scss`

### Frontend (src/app/(frontend)/)

- Dashboard: `src/app/(frontend)/dashboard/page.tsx`
- Notes: `src/app/(frontend)/notes/*`
- Instructor: `src/app/(frontend)/instructor/courses/[id]/edit/page.tsx`

## Data Flow

```
Client → Next.js Route Handler (src/app/api/) → Service Layer (src/services/) → Payload Collections → PostgreSQL
         ↓
    Middleware (auth, rate-limit, role-guard, csrf)
         ↓
    Next.js App Router → React Server Components → Payload Admin UI
```

## Infrastructure

- Docker: `docker-compose.yml` with `payload` (Node 20 Alpine) + `postgres` services
- CI: `pnpm ci` runs `payload migrate && pnpm build`
- Sharp: Image processing via @payloadcms/ui media handling
- JWT: Role-based auth embedded in token via `saveToJWT: true`

## Testing

- Integration: `vitest` (src/app/api/**/\*.test.ts, src/collections/**/\*.test.ts)
- E2E: `playwright` (tests/ directory)
- Run: `pnpm test` executes both sequentially
