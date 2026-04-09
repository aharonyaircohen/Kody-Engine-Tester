# Architecture (auto-detected 2026-04-04, updated 2026-04-09)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 + playwright 1.58.2 (E2E)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0 with PostgreSQL (`@payloadcms/db-postgres`)
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Data Flow

Next.js App Router (React Server Components) → Payload CMS REST/GraphQL API → PostgreSQL database

Admin panel served at `/admin` via `@payloadcms/next`

## Module/Layer Structure

- `src/collections/` — Payload collection configs (Users, Media, Notes, etc.)
- `src/app/` — Next.js App Router pages and API routes
- `src/app/api/` — Payload REST API endpoints auto-generated at `/api/<collection>`
- `src/middleware/` — Auth middleware (JWT validation, role guards)
- `src/auth/` — Authentication utilities
- `src/security/` — Rate limiting and security utilities

## Infrastructure

- Docker: `docker-compose.yml` with Payload + PostgreSQL services
- Dockerfile: Multi-stage build for Next.js standalone output
- CI: `pnpm ci` runs `payload migrate && pnpm build`

## Key Dependencies

- Rich text: `@payloadcms/richtext-lexical` (Lexical editor)
- Media: `sharp` for image processing
- GraphQL: `graphql ^16.8.1` included
