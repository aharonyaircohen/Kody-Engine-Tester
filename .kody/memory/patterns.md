## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`); `EnrollmentStore` exports shared `enrollmentStore` singleton.

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Decorator**: `csrf-middleware.ts` uses `Object.assign(fn, { async: fn })` to attach async method to middleware function.
- **Security Layer**: `src/security/` provides sanitizers (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`) and `validation-middleware.ts` for input sanitization at API boundaries.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query`; `EnrollmentStore` and `NotificationsStore` follow same pattern.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.
- **Role Hierarchy**: `auth/_auth.ts` defines `ROLE_HIERARCHY` where higher roles inherit lower permissions (`admin > editor > viewer`).

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Middleware (auth-middleware, csrf-middleware, role-guard, validation, rate-limiter)
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService)
    ↓
Repository Layer (Payload Collections, contactsStore, EnrollmentStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Module Boundaries

- **Entry points**: API routes, Next.js pages
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`) decouple services from Payload
- **Security boundary**: `security/sanitizers.ts` + `validation-middleware.ts` sanitize before hitting services

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- `createAuthMiddleware(userStore, sessionStore, jwtService)` — auth + rate-limit factory
- `createCsrfMiddleware(config)` — CSRF validation factory
- `requireRole(...roles)` — role-guard decorator from `role-guard.ts`
- `sanitizeHtml/sanitizeSql/sanitizeUrl` — security sanitizers
- `validate(config)` — request validation middleware from `validation-middleware.ts`

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
