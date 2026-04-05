# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (int), playwright 1.58.2 (e2e)
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
src/
├── app/
│   ├── (frontend)/          # Frontend routes (Next.js App Router)
│   └── (payload)/           # Payload admin routes (/admin)
├── collections/             # Payload collection configs
├── globals/                 # Payload global configs
├── components/              # Custom React components
├── hooks/                   # React hook functions
├── access/                  # Payload access control functions
├── middleware/              # Next.js middleware (auth, rate limiting)
├── services/                # Business logic services
├── api/                     # API route handlers
├── auth/                    # Authentication utilities
├── security/                # Security utilities (rate limiting)
├── validation/              # Input validation schemas
└── payload.config.ts        # Main Payload CMS config
```

## Data Flow

```
Client → Next.js App Router → Middleware (auth, rate limit)
       → Payload REST API (/api/<collection>)
       → Payload Collections → PostgreSQL (via @payloadcms/db-postgres)
```

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

## Infrastructure

- **Container**: Docker + docker-compose (payload + postgres services)
- **CI**: `pnpm ci` runs `payload migrate && pnpm build`
- **Deployment**: Multi-stage Dockerfile (deps → builder → runner), standalone output configured

## Key Conventions

- JWT-based auth with role guard middleware (`student`, `instructor`, `admin`)
- Rich text via Lexical editor (`@payloadcms/richtext-lexical`)
- Media handling via Payload Media collection (sharp for image processing)
- Local API operations pass `req` for transaction safety
- Type generation: `pnpm generate:types` after schema changes
- Import maps: `pnpm generate:importmap` after component changes
- Soft deletes preferred over hard deletes for audit trail
