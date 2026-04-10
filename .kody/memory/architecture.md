# Architecture (auto-detected 2026-04-10)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (unit/integration), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Infrastructure

- Docker: docker-compose.yml with Payload app + PostgreSQL services
- Dockerfile: multi-stage build for Next.js standalone output
- CI: `payload migrate && pnpm build`

## Key Files

- `src/payload.config.ts` — Payload CMS configuration
- `src/payload-types.ts` — Generated TypeScript types
- `vitest.config.mts` — Unit/integration test configuration
- `playwright.config.ts` — E2E test configuration
- `AGENTS.md` — Payload CMS development rules and patterns

## Data Flow

Payload collections (in `src/collections/`) → Local API → Next.js Route Handlers (`src/app/api/`) → Frontend Components (`src/components/`)
