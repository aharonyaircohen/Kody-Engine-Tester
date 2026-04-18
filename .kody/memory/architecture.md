# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (unit/integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

```
API Routes (src/app/api/*, src/api/*)
  └── Services (src/services/*) — business logic: gradebook, quiz-grader, course-search, progress, notifications
        └── Payload Collections (src/collections/*) — data access via Payload CMS Local API
              └── PostgreSQL (@payloadcms/db-postgres)
```

### Layer Details

- **API Routes** (`src/app/api/`, `src/api/`): REST endpoints — auth, courses, enrollments, gradebook, notes, notifications, quizzes
- **Auth Layer** (`src/auth/`): AuthService, JwtService, session-store, user-store; JWT auth with refresh token rotation
- **Collections** (`src/collections/`): Payload CMS schemas — Users, Courses, Modules, Lessons, Enrollments, Certificates, Assignments, Submissions, Quizzes, QuizAttempts, Notifications, Media
- **Services** (`src/services/`): gradebook, grading, quiz-grader, course-search, progress, notifications, discussions, certificates
- **Middleware** (`src/middleware/`): auth, csrf, rate-limiter, request-logger, role-guard, validation
- **Security** (`src/security/`): csrf-token, sanitizers, validation-middleware
- **Components** (`src/components/`): auth, board, command-palette, contacts, course-editor, dashboard, notes, notifications

## Data Flow

```
Client → Next.js Route Handler → Auth Middleware (JWT verify) → Service Layer → Payload Collections → PostgreSQL
                                                          ↓
                                                     Role Guard (RBAC: admin, editor, viewer)
```

## Infrastructure

- **Docker**: docker-compose.yml with payload + postgres services
- **CI**: `payload migrate && pnpm build` (payload migrate, next build)
- **Image Processing**: sharp for media uploads
- **GraphQL**: Payload GraphQL endpoint at `/api/graphql`
