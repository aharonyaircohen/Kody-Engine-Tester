## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`, `GradingServiceDeps<A,S,C>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).

### Structural Patterns

- **Higher-Order Function (HOC)** (`src/auth/withAuth.ts`): Wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware Chain**: `src/middleware/request-logger.ts`, `rate-limiter.ts`, and `validation.ts` implement Express-style chainable middleware for Next.js.
- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.

### Behavioral Patterns

- **Repository/Store** (`src/collections/contacts.ts`): `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store.
- **Result Type** (`src/utils/result.ts`): `Result<T, E>` discriminated union for explicit error handling.
- **Validation Strategy** (`src/middleware/validation.ts`): Field-level validators with type coercion for `string|number|boolean`.

### Architectural Layers

```
Route Handlers (src/app/(frontend)/*, src/app/(payload)/admin/*)
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService)
    ↓
Repository Layer (Payload Collections via payload.find/create/update, contactsStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Module Boundaries

- **Entry points**: Next.js App Router pages (`src/app/`), API routes (`/api/*`)
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`
- **Service deps**: Typed interfaces decouple services from Payload (e.g., `GradebookServiceDeps<T...>`)
- **Validation boundary**: `validate()` middleware at API boundaries; Zod schemas in `src/validation/` for request DTOs

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI with lifecycle management
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- `createRequestValidator(schema)` — schema-driven request validation
- `parseUrl(url, options)` — URL decomposition utility

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard batch-fetches lessons; other pages may miss similar optimizations.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
