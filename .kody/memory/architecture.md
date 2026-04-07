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
app/(frontend)/          # Next.js frontend routes (React Server Components)
app/(payload)/           # Payload admin routes (/admin)
collections/            # Payload collection configs (data schema)
access/                 # Role-based access control functions
services/                # Business logic layer
middleware/              # JWT auth, rate limiting
components/              # Shared React components
hooks/                   # Custom React hooks
contexts/                # React context providers
```

## Data Flow

```
Client → Next.js RSC → Payload Collections → PostgreSQL
                    ↓
            JWT Auth Middleware
            Rate Limiting Middleware
```

## Infrastructure

- **Docker**: docker-compose.yml (Next.js + PostgreSQL)
- **CI**: `pnpm ci` runs `payload migrate && pnpm build`
- **Dev**: `pnpm dev` starts Next.js + Payload admin
- **Migrations**: Payload DB migrations in `migrations/`
