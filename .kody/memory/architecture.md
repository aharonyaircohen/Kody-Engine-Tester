# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL (via @payloadcms/db-postgres)
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

## Module/Layer Structure

### Route Layer (src/app/api/, src/app/(payload)/, src/app/(frontend)/)

- `src/app/api/` — custom REST endpoints (notes, enrollments, gradebook, quizzes, notifications, health)
- `src/app/(payload)/` — Payload admin panel at `/admin` (importMap, custom.scss)
- `src/app/(frontend)/` — public/student-facing pages (dashboard, notes, instructor course editor)
- Payload auto-generates REST at `/api/<collection>`; GraphQL at `/api/graphql`

### Middleware Layer (src/middleware/)

- `auth-middleware.ts` — JWT authentication on protected routes
- `role-guard.ts` — RBAC enforcement (admin, instructor, student roles)
- `rate-limiter.ts` — request rate limiting
- `csrf-middleware.ts` — CSRF token validation
- `request-logger.ts` — request logging
- `validation.ts` — request body validation

### Auth Layer (src/auth/)

- `auth-service.ts` — register, login, logout operations
- `jwt-service.ts` — JWT token creation/verification
- `session-store.ts` — server-side session management
- `user-store.ts` — user persistence helpers
- `withAuth.ts` — HOC for route protection with role support

### Service Layer (src/services/)

- `gradebook.ts`, `gradebook-payload.ts` — grade aggregation per student/course
- `course-search.ts` — course search and filtering
- `progress.ts` — enrollment progress tracking
- `quiz-grader.ts` — auto-grading for quizzes
- `grading.ts` — assignment grading logic
- `notifications.ts` — notification dispatch
- `discussions.ts` — threaded discussion management
- `certificates.ts` — certificate generation on course completion

### Collection Layer (src/collections/)

- Users, Media, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Discussions, EnrollmentStore, NotificationsStore, Tasks, Contacts
- All extend Payload's `CollectionConfig` with timestamps, relationships, and role-based access control

### Security Layer (src/security/)

- `sanitizers.ts` — HTML sanitization (sanitizeHtml)
- `csrf-token.ts` — CSRF token generation/validation
- `validation-middleware.ts` — input validation middleware

### Utils Layer (src/utils/)

- DI container, cache, event-bus/message-bus, retry/queue, queryBuilder, state-machine, result types, logger, formatters, validators (ISBN), and general utilities

## Data Flow

1. **Request** → Next.js route (src/app/api/\* or Payload REST/GraphQL)
2. **Middleware chain**: rate-limiter → request-logger → auth-middleware → role-guard → validation
3. **Auth**: JWT verified via `jwt-service`; `withAuth` HOC extracts user and enforces roles
4. **Business Logic**: Route handlers delegate to **service layer** (gradebook, quiz-grader, progress, etc.)
5. **Persistence**: Services call `getPayloadInstance()` to interact with Payload collections
6. **Payload CMS**: Auto-generates admin UI at `/admin`; handles DB via `postgresAdapter`
7. **Response**: Serialized JSON (or Payload's auto-handled formats)

## Infrastructure

- **Docker**: docker-compose.yml with Node 20 + PostgreSQL; multi-stage Dockerfile for standalone Next.js
- **CI**: `.github/workflows/kody.yml` (payload migrate → pnpm build); playwright E2E tests via `tests/e2e/`
- **Testing**: vitest for unit/integration (`pnpm test:int`); playwright for E2E (`pnpm test:e2e`); `pnpm test` runs both
- **Seed**: `tests/helpers/seedUser.ts` for test fixtures
- **Admin panel**: Payload CMS at `/admin`; GraphQL playground at `/api/graphql-playground`
