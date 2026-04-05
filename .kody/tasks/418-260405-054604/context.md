
### taskify (2026-04-05T06:00:57)
{
  "task_type": "feature",
  "title": "Add request validation middleware with schema support",
  "description": "Create a validation middleware at src/middleware/validation.ts that accepts Zod-like schema objects for body/query/params validation, returns 400 with field-level errors on failure, and attaches validated data via req.validated. Add unit tests covering valid requests, invalid body, missing required fields, and optional field defaults.",
  "scope": [
    "src/middleware/validation.ts"
...(truncated)

### plan (2026-04-05T06:01:29)
## Existing Patterns Found

- **Factory pattern for middleware** (`src/middleware/rate-limiter.ts`, `request-logger.ts`): `createXMiddleware(config)` returns a `(request: NextRequest) => NextResponse` function
- **Error response shape** (`role-guard.ts`): Returns `{ error: string, status: number }` for early returns
- **Test structure** (`request-logger.test.ts`): Uses `vi.fn()` spies, `NextRequest`/`NextResponse`, and `describe`/`it` blocks
- **No Zod dependency**: The project has no Zod packag
...(truncated)

### build (2026-04-05T06:05:10)
Implementation complete. Here's a summary:

**Created `src/middleware/validation.ts`:**
- `ValidationSchema` type with `body`, `query`, `params` support
- `FieldDefinition` interface with `type`, `optional`, and `default` fields
- `validate()` function returning discriminated union `Result<T, E>` pattern
- `createValidationMiddleware()` factory returning async middleware
- Type augmentation for `NextRequest.validated`
- Returns 400 with `{ errors: ValidationError[] }` on failure
- Returns 200 wi
...(truncated)
