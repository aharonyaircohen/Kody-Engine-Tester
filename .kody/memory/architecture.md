# Architecture (auto-detected 2026-04-04)

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
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, pages, security, services, utils, validation

## LearnHub LMS

Multi-tenant Learning Management System where organizations create courses, instructors build curricula, and students enroll and track progress. Built with Next.js App Router, Payload CMS admin panel, and PostgreSQL.

## Module/Layer Structure

```
Frontend Routes (Next.js App Router)
├── (frontend)/          # Student/instructor dashboards, notes, courses
├── (payload)/admin/     # Payload CMS admin panel at /admin
└── app/api/            # Custom REST endpoints (enroll, gradebook, notifications)

Middleware Layer
├── auth-middleware.ts   # JWT authentication
├── role-guard.ts       # RBAC (student, instructor, admin)
├── rate-limiter.ts      # Request rate limiting
├── csrf-middleware.ts   # CSRF protection
└── request-logger.ts   # Request logging

Payload Collections (src/collections/)
├── Users.ts             # Auth-enabled, roles: admin/instructor/student
├── Courses.ts           # Course definitions
├── Modules.ts           # Ordered course sections
├── Lessons.ts           # Video, text, interactive content
├── Quizzes.ts           # Multiple choice, free text, code
├── Assignments.ts       # Submission + rubric grading
├── Enrollments.ts       # Student ↔ course, progress tracking
├── Discussions.ts       # Threaded per-lesson
├── Certificates.ts      # Auto-generated on completion
├── Notifications.ts     # Enrollment, grades, deadlines
├── NotificationsStore.ts
├── EnrollmentStore.ts
├── QuizAttempts.ts
├── Media.ts             # File uploads via Payload (sharp processing)
└── notes.ts             # Prototype lessons

Services (src/services/)
├── grading.ts / quiz-grader.ts      # Assignment and quiz auto-grading
├── gradebook.ts / gradebook-payload.ts  # Per-student, per-course aggregation
├── progress.ts            # Enrollment progress tracking
├── course-search.ts       # Course search/filtering
├── notifications.ts       # Notification dispatch
├── discussions.ts          # Threaded discussion management
└── certificates.ts        # Certificate generation

Access Control
└── role-guard.ts         # JWT-based RBAC middleware
```

## Data Flow

1. **Auth Flow**: JWT issued on login → stored in httpOnly cookie → `auth-middleware.ts` validates → `role-guard.ts` enforces RBAC
2. **Enrollment Flow**: Student → POST `/api/enroll` → EnrollmentStore collection → progress tracked via `progress.ts`
3. **Grading Flow**: Submission → `Submissions.ts` collection → `grading.ts` service → score stored → `gradebook.ts` aggregates
4. **API Pattern**: Payload auto-generates REST at `/api/<collection>`; custom endpoints in `src/app/api/`

## Infrastructure

- **Docker**: `docker-compose.yml` with Payload + PostgreSQL services
- **CI**: `payload migrate && pnpm build` on push
- **Image Processing**: `sharp` for media uploads
- **GraphQL**: Available at `/api/graphql` and `/api/graphql-playground`
- **Admin**: Payload CMS admin panel at `/admin`
