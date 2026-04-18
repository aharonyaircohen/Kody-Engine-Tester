# Architecture (auto-detected 2026-04-18)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm
- Module system: ESM
- AI Engine: @kody-ade/engine 0.4.4 (devDependency)
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

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

## Infrastructure

- Docker: docker-compose.yml with Node 20 + PostgreSQL
- CI: `payload migrate && pnpm build` in payload script
- Deployment: standalone output mode, Dockerfile included

## Project Structure

- `src/payload.config.ts` — Payload CMS configuration
- `src/app/(frontend)/` — Frontend routes (Next.js App Router)
- `src/app/(payload)/` — Payload admin routes
- `src/collections/` — Payload collection configs
- `src/middleware/` — Auth middleware (JWT role guards)
- `src/access/` — Access control functions
