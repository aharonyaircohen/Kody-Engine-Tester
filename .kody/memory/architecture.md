# Architecture

## Stack

- **Framework**: Next.js 16.2.1 (App Router, React Server Components)
- **CMS/Backend**: Payload CMS 3.80.0 (headless, admin at `/admin`)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Language**: TypeScript (strict mode, ESM only, `"type": "module"`)
- **Rich Text**: Lexical editor (`@payloadcms/richtext-lexical`)
- **Auth**: JWT-based with role guard middleware (roles: `student`, `instructor`, `admin`, `Engineer`, `CEO`, `CTO`, `Researcher`)
- **Media**: Payload Media collection + `sharp` for image processing

## Key Directories

```
src/
├── app/(frontend)/       # Next.js frontend routes
├── app/(payload)/        # Payload admin routes
├── collections/          # Payload CollectionConfig definitions
├── globals/              # Payload GlobalConfig definitions
├── components/           # Custom React components
├── hooks/                # Payload hook functions
├── access/               # Access control functions
├── services/             # Business logic (DI pattern)
├── auth/                 # Auth utilities and user store
├── security/             # Sanitizers (HTML, SQL, URL)
├── middleware/           # Rate limiting, role guards
├── migrations/           # Payload DB migrations
├── utils/                # Shared utilities (debounce, flatten, etc.)
├── validation/           # Input validation
└── payload.config.ts     # Main Payload config
tests/
├── e2e/                  # Playwright E2E tests
└── (int tests via vitest)
```

## Data Flow

HTTP → Next.js middleware (rate limit, auth) → App Router RSC / Payload REST/GraphQL → Payload collections → PostgreSQL

## Testing

- **Unit/Integration**: Vitest (`pnpm test:int`)
- **E2E**: Playwright (`pnpm test:e2e`, config: `playwright.config.ts`)
- **Type check**: `tsc --noEmit`

## Build Pipeline

`pnpm generate:types` → `pnpm generate:importmap` → `pnpm build`
