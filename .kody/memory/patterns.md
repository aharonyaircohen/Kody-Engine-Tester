### Structural Patterns (continued)

- **Validation Middleware** (`src/middleware/validation.ts`): Schema-driven request validation with typed `FieldDefinition`, `ValidationSchema`, and `ValidateResult` discriminated union — validates `body`/`query`/`params` against declarative schemas before route handling.

### Reusable Abstractions (continued)

- `parseUrl(url, options)` in `src/utils/url-parser.ts` — extracts `protocol`, `host`, `path`, `queryParams`, `fragment` from URL strings with optional decoding.
- `validate(schema, data, target)` in `src/middleware/validation.ts` — discriminated-union validator returning `{ ok: true, value }` or `{ ok: false, errors }`.

### Anti-Patterns / Inconsistencies (continued)

- **Inconsistent type narrowing**: `dashboard/page.tsx` uses `as unknown as` casts rather than proper type guards for Payload documents.
- **N+1 query risk**: Dashboard batch-fetches lessons but other pages may iterate enrollments without batching related queries.
