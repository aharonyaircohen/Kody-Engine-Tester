# Architecture

## Stack

- **Framework**: Next.js 16.2.1 (App Router, React Server Components)
- **CMS/Backend**: Payload CMS 3.80.0 (headless, admin at `/admin`)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Language**: TypeScript 5.7.3 (strict mode, ESM)
- **Auth**: JWT with roles (`admin`, `instructor`, `student`) saved to token
- **Rich Text**: Lexical editor for lesson content
- **Media**: Payload Media collection + sharp

## Key Directories

```
src/
├── app/(frontend)/        # Next.js frontend routes
├── app/(payload)/         # Payload admin routes
├── collections/           # Payload CollectionConfig definitions
├── globals/               # Payload global configs
├── services/              # Business logic (DI pattern)
├── access/                # Access control functions
├── security/              # Sanitizers (sanitizeHtml, sanitizeSql, sanitizeUrl)
├── hooks/                 # Payload hook functions
├── middleware/            # Rate limiting, auth guards
├── migrations/            # DB migrations
├── utils/                 # Shared utilities
└── payload.config.ts      # Root Payload config
tests/
├── e2e/                   # Playwright E2E tests
└── (unit/int via vitest)  # Vitest integration tests
```

## Data Flow

HTTP → Next.js middleware (rate limit/auth) → App Router → Payload Local API → PostgreSQL
Admin Panel → Payload REST/GraphQL API → PostgreSQL

## Testing

- **Unit/Integration**: Vitest (`pnpm test:int`)
- **E2E**: Playwright (`pnpm test:e2e`), config in `playwright.config.ts`
- Dev server: `localhost:3000`, admin: `/admin`

## Build Commands

- `payload generate:types` — regenerate `src/payload-types.ts` after schema changes
- `payload generate:importmap` — regenerate import map after component changes
- `tsc --noEmit` — TypeScript validation
