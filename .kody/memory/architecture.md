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
- src/ structure: api, app, auth, collections, components, contexts, hooks, middleware, migrations, models, pages, routes, security, services, utils

## Updated (2026-04-07)

- src/ structure now includes `models` and `routes` directories; `validation` directory removed
- Database: PostgreSQL via `@payloadcms/db-postgres` (see docker-compose.yml for local Postgres setup)
- E2E testing: Playwright 1.58.2 with `playwright.config.ts`
- CI pipeline: `payload migrate && pnpm build` (see `ci` script in package.json)
- Docker support: Dockerfile (multi-stage) + docker-compose.yml with Payload + Postgres services
- Key config files: `payload.config.ts`, `next.config.ts`, `vitest.config.mts`, `AGENTS.md` (Payload CMS rules)
- Path aliases: `@/*` maps to `./src/*`, `@payload-config` maps to `./src/payload.config.ts`
- Dependencies: `graphql`, `sharp` (image processing), `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`
- Dev dependencies: `@kody-ade/engine`, `jsdom`, `tsx`, `vite-tsconfig-paths`, `dotenv`
