# Architecture (auto-detected 2026-04-04)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Project Domain

LearnHub LMS — multi-tenant Learning Management System built on Next.js App Router with Payload CMS and PostgreSQL.

## Layer Structure

- **Frontend**: Next.js App Router with React Server Components (`src/app/(frontend)/`)
- **Admin/CMS**: Payload admin panel (`src/app/(payload)/`, `src/collections/`)
- **Auth**: JWT-based with role guard middleware (`src/auth/`, `src/security/`)
- **API**: Payload auto-generates REST at `/api/<collection>`
- **Services/Utils**: `src/services/`, `src/utils/`, `src/hooks/`
- **Access Control**: `src/access/` for Payload access control functions
- **Validation**: `src/validation/` for input validation

## Database

- PostgreSQL via `@payloadcms/db-postgres` 3.80.0
- Connection via `DATABASE_URL` env var
- Payload manages migrations in `src/migrations/`

## Infrastructure

- **Container**: `docker-compose.yml` (Node 20 + PostgreSQL)
- **CI**: `payload migrate && pnpm build` via `pnpm ci`
- **Docker**: `Dockerfile` for standalone Next.js output

## Key Dependencies

- `@payloadcms/next`, `@payloadcms/ui`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical` (all 3.80.0)
- `graphql` 16.8.1, `sharp` 0.34.2 for image processing

## Development Patterns

- Run `generate:types` after schema changes
- Run `tsc --noEmit` to validate TypeScript
- Payload collections in `src/collections/`, globals in `src/globals/`
- Custom React components in `src/components/`
- See `AGENTS.md` for Payload-specific development rules
