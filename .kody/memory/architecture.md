# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Data Layer

- Database: PostgreSQL via `@payloadcms/db-postgres` (pool connection)
- ORM: Payload CMS collections with postgres adapter
- Payload auto-generates types to `src/payload-types.ts`
- Auto-generated REST API at `/api/<collection>` and GraphQL at `/api/graphql`

## API Layer

- `src/app/api/` — custom Next.js Route Handlers (enroll, gradebook, notes, notifications, quizzes, dashboard stats, health, search, csrf-token)
- `src/app/(payload)/api/` — Payload REST (`/[...slug]`) and GraphQL endpoints
- `src/api/auth/` — auth Route Handlers (login, logout, register, refresh, profile)
- GraphQL Playground at `/api/graphql-playground`

## Module/Layer Structure

- `src/collections/` → Payload collection configs (Users, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Notes, Media)
- `src/services/` → Business logic (gradebook, grading, progress, certificates, notifications, discussions, course-search, quiz-grader)
- `src/middleware/` → Express-style middleware (auth, role-guard, csrf, rate-limiter, request-logger, validation)
- `src/auth/` → JWT service, session store, user store, withAuth guard
- `src/components/` → React components grouped by domain (auth, board, command-palette, contacts, course-editor, dashboard, notes, notifications)
- `src/contexts/` → React contexts (auth-context)
- `src/hooks/` → Custom hooks (useCommandPalette, useCommandPaletteShortcut)
- `src/security/` → CSRF tokens, input sanitizers, validation middleware
- `src/migrations/` → Payload DB migrations
- `src/models/` → Data models (notification)
- `src/routes/` → Route definitions (notifications)
- `src/pages/` → Legacy Next.js pages (auth, board, contacts, error, notifications)
- `src/app/(frontend)/` → Next.js App Router frontend pages (dashboard, notes, instructor)
- `src/app/(payload)/` → Payload admin at `/admin` and Payload API routes

## Domain Model

```
Organization
├── Users (roles: admin, instructor, student)
├── Courses
│   ├── Modules
│   │   ├── Lessons
│   │   ├── Quizzes → QuizAttempts
│   │   └── Assignments → Submissions
│   ├── Enrollments
│   ├── Discussions
│   └── Certificates
├── Gradebook (per-student, per-course)
└── Notifications
```

## Infrastructure

- Docker: `docker-compose.yml` with payload (Node 20) + postgres services
- CI: `pnpm ci` runs `payload migrate` then `pnpm build`
- Dev: `pnpm dev` with `.env` (DATABASE_URL, PAYLOAD_SECRET)
