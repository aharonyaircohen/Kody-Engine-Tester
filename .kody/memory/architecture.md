# Architecture (auto-detected 2026-04-17)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 + playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Frontend Structure

- `src/app/(frontend)/` — Next.js App Router pages (dashboard, notes, instructor views)
- `src/app/(payload)/` — Payload admin routes (`/admin`)
- `src/components/` — React components organized by feature (auth, board, command-palette, contacts, course-editor, dashboard, notes, notifications)
- `src/contexts/` — React contexts (auth-context)
- `src/pages/` — Legacy pages (auth, board, contacts, error, notifications)

## API Structure

- Payload REST: `src/app/(payload)/api/[...slug]/route.ts` (auto-generated)
- Custom API: `src/app/api/` (courses, enroll, gradebook, health, notes, notifications, quizzes, dashboard, csrf-token)
- Auth API: `src/api/auth/` (login, logout, register, refresh, profile)

## Payload Collections

Located in `src/collections/`: Users, Media, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Contacts, Discussions

## Auth & Security

- JWT-based auth with role guards (`student`, `instructor`, `admin`)
- Middleware stack: `src/middleware/` (auth, role-guard, csrf, rate-limiter, request-logger, validation)
- Security utilities: `src/security/` (sanitizers, validation-middleware, csrf-token)
- Auth services: `src/auth/` (jwt-service, auth-service, session-store, user-store, withAuth)

## Services Layer

`src/services/`: certificates, course-search, discussions, gradebook, grading, notifications, progress, quiz-grader

## Data Model

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

- Docker: `docker-compose.yml` (payload + postgres)
- CI: `.github/workflows/test-ci.yml`, `.github/workflows/kody.yml`
- Node.js 18.20.2+ / 20.9.0+
- Sharp for image processing

## Domain Model (auto-detected 2026-04-04)

See README.md for full domain model and implementation status.
