# Architecture

**Tech Stack**: Next.js 16 + React 19 + Payload CMS 3.80 + PostgreSQL + TypeScript

**Database**: PostgreSQL with Payload DB adapter (@payloadcms/db-postgres)
**API**: GraphQL via Payload CMS
**Frontend**: Next.js App Router with React 19
**Storage**: Local disk adapter

**Key Directories**:
- `src/app/` - Next.js pages and layouts
- `src/collections/` - Payload CMS collection definitions
- `src/migrations/` - Database migrations
- `src/utils/` - Utility functions and helpers

**Testing**:
- Unit tests: `src/**/*.test.ts` via Vitest
- Integration tests: `tests/int/**/*.int.spec.ts` via Vitest
- E2E tests: Playwright

**Data Flow**: GraphQL queries/mutations → Payload CMS → PostgreSQL