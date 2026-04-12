### Architectural Layers (updated)

```
Route Handlers (src/api/*, src/app/*)
    ↓
Validation Middleware (src/middleware/validation.ts) → Schema-driven field validation
    ↓
Auth HOC (src/auth/withAuth.ts) → JWT Service → AuthService
    ↓
Service Layer (src/services/*.ts: GradebookService, GradingService, ProgressService)
    ↓
Repository Layer (Payload Collections, contactsStore)
    ↓
Database (PostgreSQL via @payloadcms/db-postgres)
```

### Additional Structural Patterns

- **Validation Schema** (`src/middleware/validation.ts`): Declarative field validation with `FieldDefinition`, `ValidationSchema`, type coercion (`convertValue`), and discriminated `ValidateResult` union. Applied at API boundaries via `validate(schema, data, target)`.
- **Generic Service with Typed Dependencies** (`src/services/gradebook.ts`, `src/services/grading.ts`): `GradebookServiceDeps<T...>` and `GradingServiceDeps<A,S,C>` interfaces decouple services from Payload; phantom type parameters enable compile-time domain object binding without inheritance.

### Additional Reusable Abstractions

- `validate(schema, data, target)` — schema-driven validation for `body|query|params`
- `isValidNumber(value)` / `convertValue(value, type)` — type coercion utilities
- `parseUrl(url, options)` — `src/utils/url-parser.ts` with decode/format options

### Anti-Patterns / Inconsistencies (updated)

- **Dual auth systems**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — inconsistent password hashing and user representation.
- **Role divergence**: `UserStore.UserRole = 'admin'|'user'|'guest'|'student'|'instructor'` vs `RbacRole = 'admin'|'editor'|'viewer'` — no alignment.
- **N+1 risk**: Dashboard page batch-fetches lessons but other pages may not.
- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards.
- **Parallel in-memory stores**: `contactsStore` (contacts.ts) reimplements repository patterns that Payload handles via collections — redundant abstraction layer.
