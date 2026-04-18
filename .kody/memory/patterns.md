## LearnHub LMS Design Patterns

### Creational Patterns

- **Dependency Injection Container** (`src/utils/di-container.ts`): Type-safe DI with tokens, factory registration, singleton/transient lifecycles, and circular dependency detection via `resolving` Set.
- **Factory Functions**: DI container registers factory functions; service constructors accept dep interfaces (e.g., `GradebookServiceDeps<T...>`).
- **Singleton**: Container caches singletons in `singletons` Map; Auth exports module-level singleton instances (`userStore`, `sessionStore`, `jwtService`).
- **Builder Pattern** (`src/utils/schema.ts`): Mini-Zod with fluent chainable API (`s.string().optional()`, `s.object({}).default()`), type inference via `_type` phantom property.

### Structural Patterns

- **Higher-Order Function (HOC)**: `src/auth/withAuth.ts` wraps Next.js route handlers with JWT validation and RBAC checks.
- **Middleware**: `src/middleware/request-logger.ts` and `rate-limiter.ts` implement Express-style chainable middleware for Next.js.
- **Context Provider** (`src/contexts/auth-context.tsx`): React Context + `AuthProvider` for client-side auth state with token refresh scheduling via `scheduleRefresh`.
- **Custom Hooks** (`src/hooks/useCommandPalette.ts`, `src/hooks/useFormValidation.ts`): Reusable stateful logic abstractions with localStorage persistence.
- **Sanitizer Layer** (`src/security/sanitizers.ts`): HTML, SQL, URL, filepath sanitizers applied via `sanitizeObject` recursive traversal.

### Behavioral Patterns

- **Strategy**: `request-logger.ts` switches between `json`/`text` output formats; log level Strategy maps HTTP status codes to `debug|info|warn|error`.
- **Repository/Store**: `src/collections/contacts.ts` exposes `contactsStore` with `getById|create|update|delete|query` — hybrid repository-pattern store. Same pattern across `NotificationsStore`, `EnrollmentStore`, `DiscussionsStore`, `LessonStore`, `NotesStore`, `ModuleStore`, `CertificatesStore`, `TaskStore`.
- **Result Type**: `src/utils/result.ts` provides `Result<T, E>` discriminated union for explicit error handling.
- **Validator Composition** (`src/validation/validators.ts`, `compose.ts`): Composable validator functions returning `ValidatorResult = { valid: true } | { valid: false; error: string }`; `compose()` chains validators short-circuiting on first failure.
- **Rate Limiter Strategy** (`src/middleware/rate-limiter.ts`): `SlidingWindowRateLimiter` with configurable key extraction via `byIp`, `byApiKey` strategy functions.
- **Role Guard** (`src/middleware/role-guard.ts`): `requireRole(...roles)` decorator-style guard for route protection.

### Architectural Layers

```
Route Handlers (src/api/*, src/app/*)
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService, DiscussionService)
    ↓
Repository Layer (Payload Collections, ContactStore, NotificationsStore, DiscussionsStore, EnrollmentStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Module Boundaries

- **Entry points**: API routes, Next.js pages
- **Auth boundary**: `withAuth` HOC + `extractBearerToken` + `checkRole`
- **Service deps**: Typed interfaces (e.g., `GradingServiceDeps<A,S,C>`) decouple services from Payload
- **Validation boundary**: `ValidateConfig` + `ValidatedRequest` (`src/security/validation-middleware.ts`) vs `ValidationSchema` (`src/middleware/validation.ts`) — two overlapping validation systems

### Reusable Abstractions

- `Container.register<T>(token, factory)` — generic DI
- `DIDisposable` interface for lifecycle cleanup
- `createRequestLogger(config)` — configurable middleware factory
- `SlidingWindowRateLimiter` — rate limiting with configurable window/limit
- `s.string()|number()|boolean()|object()|array()` — mini-Zod schema builder
- `compose(...validators)` — validator composition
- `sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`, `sanitizeFilePath` — security sanitizers
- Zod schemas in `src/validation/` for input validation at API boundaries

### Anti-Patterns / Inconsistencies

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
- **Dual validation systems**: `src/middleware/validation.ts` (field-based) vs `src/utils/schema.ts` (mini-Zod) vs `src/validation/validators.ts` (composable validators) — three overlapping approaches.
- **Scattered security**: CSRF in both `src/security/csrf-token.ts` and `src/middleware/csrf-middleware.ts`; sanitizers in `src/security/sanitizers.ts` separate from validation layer.
