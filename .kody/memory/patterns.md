## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).
- **Builder Pattern** (`src/utils/schema.ts`): Mini-Zod schema builder with fluent API (`s.string()`, `s.object()`, etc.) and type inference via `Infer<T>`.

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Security Middleware** (`src/security/validation-middleware.ts`): Decorates Next.js route handlers with schema validation and HTML sanitization; attaches `__validated__` to request object.
- **Sanitizer Functions** (`src/security/sanitizers.ts`): Standalone HTML, SQL, URL, and filepath sanitizers; `sanitizeObject()` recursively applies per-field sanitization based on schema shape.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query`; also `EnrollmentStore`, `DiscussionsStore`, `NotificationsStore` with in-memory Map-backed persistence.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union (`Ok<T>`, `Err<T>`) with `unwrap`, `map`, `mapErr`, `andThen`, `match`.
- **Observer** (partial): `NotificationsStore` exposes `getUnread()`, `markAsRead()`, `markAllRead()`; services layer notifies via `NotificationService`.

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService, DiscussionService, NotificationService, CourseSearchService)
    ↓
Store Layer (EnrollmentStore, DiscussionsStore, NotificationsStore — in-memory Map; contactsStore — hybrid)
    ↓
Repository Layer (Payload Collections)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Module Boundaries

- **Entry points**: API routes, Next.js pages
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`; `role-guard.ts` for role hierarchy checks
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`, `GradebookServiceDeps<...>`) decouple services from Payload
- **Security boundary**: `validation-middleware.ts` + `sanitizers.ts` gate request validation; `csrf-middleware.ts` for CSRF protection

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- Schema builder (`src/utils/schema.ts`): `s.string()`, `s.number()`, `s.boolean()`, `s.object<S>()`, `s.array<T>()` with `optional()` and `default()` modifiers
- `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`, `sanitizeFilePath` — standalone security sanitizers
- `Result<T,E>`: `ok()`, `err()`, `tryCatch()`, `fromPromise()` utilities

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
- **FIXME: Bulk notifications**: `NotificationService.notify()` sends one-by-one instead of batching.
