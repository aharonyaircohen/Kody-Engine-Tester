# Architecture

## Stack

- **Framework**: Next.js 16.2.1 (App Router, React Server Components)
- **CMS/Backend**: Payload CMS 3.80.0 (headless, admin at `/admin`)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Auth**: JWT-based with role guard middleware (roles: `student`, `instructor`, `admin`)
- **Rich Text**: Lexical editor (`@payloadcms/richtext-lexical`)
- **Language**: TypeScript 5.7.3 strict mode, ESM (`"type": "module"`)
- **Package Manager**: pnpm

## Key Directories

```
src/
├── app/
│   ├── (frontend)/     # Next.js frontend routes
│   └── (payload)/      # Payload admin routes
├── collections/        # Payload CollectionConfig definitions
├── globals/            # Payload global configs
├── services/           # Business logic layer (DI pattern)
├── security/           # Sanitizers (sanitizeHtml, sanitizeSql, sanitizeUrl)
├── auth/               # Auth types and user store
├── middleware/         # Rate limiting, role guards
├── hooks/              # Payload hook functions
├── access/             # Access control functions
├── components/         # Custom React components
├── utils/              # Utility functions
├── validation/         # Input validation schemas
└── payload.config.ts   # Main Payload config
tests/
├── e2e/               # Playwright E2E tests
└── (integration)/      # Vitest integration tests
```

## Data Flow

1. Frontend (RSC) → Payload Local API or REST `/api/*`
2. Payload hooks → service layer (DI injected) → PostgreSQL
3. Admin panel → Payload REST/GraphQL → PostgreSQL
4. Auth: JWT issued by Payload, `saveToJWT: true` for roles

## Testing

- **Integration**: Vitest (`pnpm test:int`) — `vitest.config.mts`
- **E2E**: Playwright (`pnpm test:e2e`) — `playwright.config.ts`
- **Type check**: `tsc --noEmit`

## Domain Model

Organization → Users → Courses → Modules → Lessons/Quizzes/Assignments → Enrollments → Certificates/Gradebook/Notifications
