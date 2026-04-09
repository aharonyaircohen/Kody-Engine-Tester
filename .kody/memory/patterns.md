### Architectural Layers (updated)

```
Route Handlers (src/app/api/*, src/app/*)
    ↓
Validation Middleware (src/middleware/validation.ts) → Schema-based body/query/params validation
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService)
    ↓
Repository Layer (Payload Collections via find/create/update, contactsStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres + raw SQL migrations)
```

### Module Boundaries (updated)

- **Entry points**: API routes, Next.js pages, Next.js App Router server components
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole` + `AuthService`
- **Validation boundary**: `src/middleware/validation.ts` provides `validate()` for schema-based request validation
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`, `GradebookServiceDeps<...>`) decouple services from Payload

### Reusable Abstractions (updated)

- `Container.register<T>(token, factory)` — generic DI with symbol tokens
- `validate(schema, data, target)` — schema-driven request validation for body/query/params
- `parseUrl(url, options)` — pure function URL parser in `src/utils/url-parser.ts`
- `createRequestLogger(config)` — configurable middleware factory in `request-logger.ts`
- Zod schemas in `src/validation/` for input validation at API boundaries

### New Patterns Discovered

- **Validation Schema Pattern** (`src/middleware/validation.ts`): Declarative field definitions with type coercion (string/number/boolean), field-level required/optional, and target-specific validation (body/query/params).
- **Seed Data Constant** (`src/collections/contacts.ts`): `SEED_CONTACTS` array provides fixture data for development/testing.
- **Paginated Query Interface** (`src/collections/contacts.ts`): `PaginationOptions`, `PaginatedResult<T>`, `QueryOptions` with sort/filter/pagination — reusable pagination contract.
- **Migration Pattern** (`src/migrations/*.ts`): Raw SQL via `db.execute(sql\`...\`)`with`MigrateUpArgs`/`MigrateDownArgs` convention.

### Anti-Patterns / Inconsistencies (updated)

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing.
- **Role divergence**: `UserStore.UserRole` vs `RbacRole` — no alignment between auth implementations.
- **Type safety gaps**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards for Payload documents.
- **Inconsistent pagination**: `contacts.ts` defines its own `PaginatedResult<T>` while Payload collections return their own pagination shape.
