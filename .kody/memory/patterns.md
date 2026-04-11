### Behavioral Patterns (continued)

- **Validation Middleware** (`src/middleware/validation.ts`): Schema-driven validation of `body`/`query`/`params` at API boundaries — converts and validates field types (`string|number|boolean`), collects `ValidationError[]`, returns `ValidateResult` discriminated union.

### Architectural Layers (continued)

```
API Routes → Validation Middleware → Auth HOC → Service Layer → Repository (Payload Collections / contactsStore)
```

### Reusable Abstractions (continued)

- `validate(schema, data, target)` — schema-validated request parsing with type coercion
- `parseUrl(url, options)` — `src/utils/url-parser.ts` for URL decomposition

### Anti-Patterns / Inconsistencies (continued)

- **Validation middleware not integrated into all routes**: `validation.ts` exists but dashboard page uses `as unknown as` casts rather than validation schema at boundaries.
- **Seed data in collections**: `contacts.ts` embeds `SEED_CONTACTS` array — seed logic should live in migrations, not runtime data files.
