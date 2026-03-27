# Architecture

**Framework**: Next.js 16.2.1 (App Router), React 19.2.4
**Language**: TypeScript 5.7.3 (strict mode)
**CMS**: Payload CMS 3.80.0 (headless, admin at `/admin`)
**Database**: PostgreSQL via @payloadcms/db-postgres
**Auth**: JWT-based with role-based middleware (student, instructor, admin)
**Testing**: Vitest (unit/integration), Playwright 1.58.2 (E2E)
**Rich Text**: Lexical editor

**Key Directories**:
- `src/api/` - API routes and endpoints
- `src/app/` - App Router pages
- `src/collections/` - Payload CMS collections
- `src/components/` - React components
- `src/middleware/` - Auth and rate limiting
- `tests/` - Test files