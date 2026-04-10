## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18, playwright 1.58.2
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0 with Lexical rich text editor
- Database: PostgreSQL via @payloadcms/db-postgres
- Package manager: pnpm ^9 || ^10
- Module system: ESM
- Auth: JWT-based with role guard middleware (student, instructor, admin)
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Data Flow

Request → Next.js App Router (RSC) → Payload Local API → Access Control Hooks → Collections → PostgreSQL

## Module/Layer Structure

Collections (src/collections/) → Access Control (src/access/) → Hooks → PostgreSQL via @payloadcms/db-postgres

Frontend: Next.js App Router with React Server Components; Admin panel at /admin via @payloadcms/next

## Infrastructure

- Docker: docker-compose.yml with postgres service; Dockerfile for standalone Next.js deployment
- CI: `ci` script runs `payload migrate && pnpm build`
- Dev: `pnpm dev` with cross-env NODE_OPTIONS=--no-deprecation
