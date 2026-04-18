# Architecture (auto-detected 2026-04-18)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (unit/integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Auth: JWT with role guard middleware (student, instructor, admin)
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Module/Layer Structure

```
Frontend Routes (src/app/(frontend)/)
├── dashboard/page.tsx
├── instructor/courses/[id]/edit/page.tsx
├── notes/ (CRUD pages)
└── page.tsx (home)
└── layout.tsx

Payload Admin Routes (src/app/(payload)/)
├── api/graphql/route.ts
├── api/graphql-playground/route.ts
└── api/[...slug]/route.ts (Payload REST)

Custom REST API (src/app/api/)
├── enroll/route.ts
├── gradebook/route.ts, gradebook/course/[id]/route.ts
├── notifications/route.ts, [id]/read/route.ts, read-all/route.ts
├── quizzes/[id]/route.ts, submit/route.ts, attempts/route.ts
├── courses/search/route.ts
├── notes/route.ts, [id]/route.ts
├── dashboard/admin-stats/route.ts
├── csrf-token/route.ts
└── health/route.ts

Auth Layer (src/auth/)
├── index.ts — exports userStore, sessionStore, jwtService
├── jwt-service.ts — JWT sign/verify
├── session-store.ts — session management
├── user-store.ts — User model and CreateUserInput type
└── withAuth.ts — route protection wrapper

Collections (src/collections/) — Payload CMS schemas
├── Users.ts (auth: true, roles: admin/instructor/student)
├── Courses.ts, Modules.ts, Lessons.ts
├── Enrollments.ts, Certificates.ts
├── Assignments.ts, Submissions.ts
├── Quizzes.ts, QuizAttempts.ts
├── Notifications.ts, Notes.ts, Media.ts, Discussions.ts

Middleware (src/middleware/)
├── auth-middleware.ts — JWT verification
├── role-guard.ts — RBAC enforcement
├── rate-limiter.ts
├── csrf-middleware.ts
├── request-logger.ts
└── validation.ts

Security (src/security/)
├── csrf-token.ts
├── sanitizers.ts
└── validation-middleware.ts

Services (src/services/)
└── certificates.service.ts (business logic)
```

## Data Flow

```
Client → Next.js App Router (RSC)
  ├── Custom API routes (src/app/api/) → Services/Auth → PostgreSQL
  └── Payload REST/GraphQL (src/app/(payload)/api/) → Payload Collections → PostgreSQL

Authentication Flow:
  POST /api/auth/login → auth-service.ts → jwt-service.ts (sign JWT)
  Subsequent requests → auth-middleware.ts → jwt-service.ts (verify JWT)
  Role checks → role-guard.ts middleware
```

## Infrastructure

- **Docker**: docker-compose.yml (Next.js + PostgreSQL)
- **CI**: `ci` script runs `payload migrate && pnpm build`
- **Image processing**: sharp (included in pnpm.onlyBuiltDependencies)
- **Rich text**: Lexical editor via `@payloadcms/richtext-lexical`
- **Dev**: `pnpm dev` with hot reload; `payload` CLI for migrations/generation
