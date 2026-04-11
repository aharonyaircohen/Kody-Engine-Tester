# Architecture (auto-detected 2026-04-04, updated 2026-04-11)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 + playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Infrastructure

- Docker: docker-compose.yml (Payload + PostgreSQL services) and Dockerfile for standalone Next.js deployment
- CI: `payload migrate && pnpm build` in pipeline
- Media: sharp 0.34.2 for image processing

## Application Structure

- Frontend routes: `src/app/(frontend)/`
- Payload admin routes: `src/app/(payload)/` (admin panel at `/admin`)
- Collections: `src/collections/` (Payload CMS collection configs)
- Access control: `src/access/` (role guard functions)
- Globals: `src/globals/`
- Rich text: Lexical editor via @payloadcms/richtext-lexical
- GraphQL: graphql ^16.8.1 included

## Data Flow

Payload collections define the schema → REST/GraphQL endpoints auto-generated at `/api/<collection>` → JWT auth with role middleware (`student`, `instructor`, `admin`) → Next.js App Router handles frontend routing

## Domain (LearnHub LMS)

Organization (tenant) → Users (roles) → Courses → Modules → Lessons/Quizzes/Assignments → Enrollments → Certificates/Gradebook/Notifications

## Testing

- Integration: vitest (configured in vitest.config.mts)
- E2E: playwright (configured in playwright.config.ts)
- Run all: `pnpm test` (int + e2e)

## Key Files

- `src/payload.config.ts` — Payload CMS configuration entry
- `src/payload-types.ts` — Generated TypeScript types
- `next.config.ts` — Next.js configuration
- `AGENTS.md` — Payload CMS development rules
