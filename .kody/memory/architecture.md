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

## Application Type

LearnHub LMS — multi-tenant Learning Management System with organizations, courses, instructors, and students. JWT auth with role guards (student, instructor, admin). Payload CMS admin panel at `/admin`.

## Infrastructure

- Docker: docker-compose.yml (Next.js + PostgreSQL), multi-stage Dockerfile
- CI: `pnpm ci` runs `payload migrate && pnpm build`

## Data Flow

Payload collections define the domain model. REST API auto-generated at `/api/<collection>`. Next.js App Router handles frontend via React Server Components. JWT tokens carry user roles for access control.

## Module/Layer Structure

- `src/collections/` — Payload collection configs (Users, Media, Notes as prototype)
- `src/app/` — Next.js App Router pages and layouts
- `src/middleware/` — Auth role guards, rate limiting
- `src/services/` — Business logic services
- `src/api/` — Custom API routes
- `src/components/` — React components
