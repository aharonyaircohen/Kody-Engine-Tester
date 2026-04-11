# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 + playwright 1.58.2 (E2E)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Project Type & Domain

- **LearnHub LMS** — Multi-tenant Learning Management System
- **Roles**: admin, instructor, student (JWT-based auth with role guard middleware)
- **Domain Model**: Organization → Courses → Modules → Lessons/Quizzes/Assignments → Enrollments → Certificates/Gradebook

## Infrastructure

- **Database**: PostgreSQL via `@payloadcms/db-postgres` (docker-compose postgres service)
- **Container**: Dockerfile (multi-stage build, Node 22.17.0-alpine) + docker-compose.yml
- **Image processing**: sharp 0.34.2
- **CI**: `pnpm ci` runs `payload migrate && pnpm build`

## Data Flow

```
Client → Next.js App Router → Payload REST API (/api/<collection>)
                              ↓
                        PostgreSQL (via @payloadcms/db-postgres)
```

## Module/Layer Structure

```
src/
├── app/              # Next.js App Router pages/routes
│   ├── (frontend)/   # Frontend routes
│   └── (payload)/    # Payload admin routes (/admin)
├── collections/      # Payload collection configs
├── components/       # Custom React components
├── hooks/            # Custom React hooks
├── middleware/       # Auth (JWT), rate limiting middleware
├── auth/             # Auth utilities
├── security/         # Security helpers
├── services/         # Business logic
├── routes/           # Custom route handlers
├── models/           # Data models
├── api/              # API utilities
├── utils/            # General utilities
└── payload.config.ts # Payload CMS configuration
```

## Testing

- **Unit/Integration**: vitest 4.0.18 (`pnpm test:int`)
- **E2E**: playwright 1.58.2 (`pnpm test:e2e`)
- **Config**: `vitest.config.mts`, `playwright.config.ts`

## Key Dependencies

- `@payloadcms/db-postgres`: 3.80.0
- `@payloadcms/next`: 3.80.0
- `@payloadcms/ui`: 3.80.0
- `@payloadcms/richtext-lexical`: 3.80.0
- `graphql`: 16.8.1
- `next`: 16.2.1
- `payload`: 3.80.0
