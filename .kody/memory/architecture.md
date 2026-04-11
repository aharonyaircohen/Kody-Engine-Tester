# Architecture (auto-detected 2026-04-11)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
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
├── globals/                 # Payload globals configs
├── components/              # Custom React components
├── hooks/                   # Hook functions
├── access/                  # Access control functions (RBAC)
├── middleware/               # Express/Payload middleware (auth, rate-limiting)
├── migrations/              # Payload migrations
├── models/                  # Domain models (courses, lessons, enrollments)
├── routes/                  # API route handlers
├── services/                # Business logic services
├── security/                # Security utilities
├── utils/                   # Utility functions
├── validation/               # Input validation schemas
└── payload.config.ts        # Main Payload CMS configuration
```

## Data Flow

1. **Client** → Next.js App Router (React Server Components)
2. **API Layer** → Payload REST/GraphQL API (`/api/<collection>`)
3. **Access Control** → Role guard middleware (student, instructor, admin)
4. **Business Logic** → Services layer
5. **Data Access** → Payload CMS collections with PostgreSQL adapter

## Infrastructure

- **Containerization**: Docker + docker-compose (postgres + payload services)
- **CI**: `payload migrate && pnpm build` on the `ci` script
- **Admin Panel**: Payload CMS admin UI at `/admin`

## Domain Model (LMS)

Organization (tenant) → Users (admin/instructor/student) → Courses → Modules → Lessons/Quizzes/Assignments → Enrollments → Gradebook + Certificates

## Key Dependencies

- `@payloadcms/db-postgres` - PostgreSQL adapter
- `@payloadcms/next` - Next.js integration for Payload
- `@payloadcms/richtext-lexical` - Rich text editor
- `@payloadcms/ui` - Admin UI components
- `@kody-ade/engine` - Kody engine for test generation
- `graphql` - GraphQL API support
- `sharp` - Image processing for media
