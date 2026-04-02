# Architecture

## Stack

- **Framework**: Next.js 16.2.1 (App Router, React Server Components) + Payload CMS 3.80.0
- **Language**: TypeScript 5.7.3 (strict mode, ESM)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Auth**: JWT-based, roles: `admin`, `instructor`, `student`, saved to JWT (`saveToJWT: true`)
- **Rich Text**: Lexical editor (`@payloadcms/richtext-lexical`)
- **Media**: Payload Media collection with sharp

## Key Directories

```
src/
├── app/(frontend)/      # Next.js frontend routes
├── app/(payload)/       # Payload admin routes (/admin)
├── collections/         # CollectionConfig definitions
├── services/            # Business logic (DI pattern)
├── access/              # Access control functions
├── hooks/               # Payload hooks
├── middleware/          # Rate limiting, role guard
├── security/            # sanitizeHtml, sanitizeSql, sanitizeUrl
├── auth/                # User store, session logic
├── utils/               # Shared utilities (debounce, flatten, etc.)
├── validation/          # Zod schemas
└── payload.config.ts    # Main Payload config
tests/
├── e2e/                 # Playwright tests
└── (vitest unit/int)    # Co-located or top-level
```

## Data Flow

Next.js page → Payload Local API (bypasses access control) or REST/GraphQL API (enforces access control) → PostgreSQL

## Testing

- **Unit/Integration**: Vitest (`pnpm test:int`)
- **E2E**: Playwright (`pnpm test:e2e`) — admin panel at `/admin`, frontend at `/`
- Dev server: `http://localhost:3000`, test user: `dev@payloadcms.com/test`

## References

- `AGENTS.md`: Payload CMS development rules (TypeScript-first, transaction safety, type generation)
- `src/payload.config.ts`: Payload entry point
