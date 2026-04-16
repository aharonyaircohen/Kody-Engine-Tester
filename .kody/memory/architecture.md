# Architecture (auto-detected 2026-04-16)

## Overview

- Framework: Next.js 16.2.1
- Language: TypeScript 5.7.3
- Testing: vitest 4.0.18 (int), playwright 1.58.2 (e2e)
- Linting: eslint ^9.16.0
- Formatting: prettier ^3.4.2
- CMS: Payload CMS 3.80.0
- Database: PostgreSQL via `@payloadcms/db-postgres`
- Package manager: pnpm
- Module system: ESM
- Top-level directories: docs, scripts, skills, src, tests
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils, validation

## Application Structure

- Frontend: Next.js App Router with React Server Components
- Backend/CMS: Payload CMS (admin panel at `/admin`)
- Auth: JWT-based with role guard middleware (`student`, `instructor`, `admin`)
- Rich Text: Lexical editor via `@payloadcms/richtext-lexical`
- Media: File uploads via Payload Media collection (sharp for image processing)

## Module/Layer Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes
│   └── (payload)/           # Payload admin routes
├── collections/             # Payload collection configs
├── globals/                 # Payload global configs
├── components/              # Custom React components
├── hooks/                   # Hook functions
├── access/                  # Access control functions
├── middleware/              # Express/Next.js middleware
├── services/                # Business logic services
├── utils/                   # Utility functions
├── validation/              # Input validation schemas
└── payload.config.ts        # Main Payload config
```

## Infrastructure

- Docker: docker-compose with Node.js + PostgreSQL services
- Dockerfile: Multi-stage build (deps → builder → runner), standalone output
- CI: `payload migrate && pnpm build` on merge
- Database migrations via Payload CLI (`payload migrate`)
