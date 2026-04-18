# Architecture (auto-detected 2026-04-04, extended 2026-04-18)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Layer Architecture

```
Next.js App Router (React Server Components)
├── (frontend) routes → server-side rendering, RSC data fetching
└── (payload) routes → Payload admin panel at /admin
    └── Payload CMS → PostgreSQL via @payloadcms/db-postgres
```

## Data Flow

1. **Client** → Next.js App Router (RSC) → Payload REST API (`/api/<collection>`)
2. **Payload Collections** → `@payloadcms/db-postgres` adapter → PostgreSQL
3. **Auth**: JWT-based with role guard middleware (`student`, `instructor`, `admin`)
4. **Media**: File uploads via Payload Media collection (sharp for image processing)

## Key Infrastructure

- **Docker**: docker-compose with `payload` (Node 20 Alpine) + `postgres` services
- **CI**: `payload migrate && pnpm build` (see package.json `ci` script)
- **Dev**: `pnpm dev` with hot reload, `payload` CLI for migrations/generation

## Domain Model (LearnHub LMS)

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

## Testing

- **Unit/Integration**: vitest (`.int` tests via `pnpm test:int`)
- **E2E**: Playwright (`pnpm test:e2e`)
- **Full suite**: `pnpm test` runs both sequentially

## Project-Specific Notes

- Payload collections live in `src/collections/`, globals in `src/globals/`
- Custom React components in `src/components/`
- Access control functions in `src/access/`
- Hook functions in `src/hooks/`
- Path alias `@/*` maps to `./src/*`, `@payload-config` to `./src/payload.config.ts`
- Payload types auto-generated to `payload-types.ts` via `generate:types`
