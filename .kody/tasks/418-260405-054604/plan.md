## Existing Patterns Found

- **Factory pattern for middleware** (`src/middleware/rate-limiter.ts`, `request-logger.ts`): `createXMiddleware(config)` returns a `(request: NextRequest) => NextResponse` function
- **Error response shape** (`role-guard.ts`): Returns `{ error: string, status: number }` for early returns
- **Test structure** (`request-logger.test.ts`): Uses `vi.fn()` spies, `NextRequest`/`NextResponse`, and `describe`/`it` blocks
- **No Zod dependency**: The project has no Zod package, so the middleware must implement a lightweight schema validator from scratch

---

## Plan

### Step 1: Write tests for the validation middleware

**File:** `src/middleware/validation.test.ts`

Create tests covering:
- Valid request passes through with `req.validated` populated
- Invalid body returns 400 with field-level errors
- Missing required fields detected
- Optional fields with defaults applied
- Query and params validation

**Verify:** `pnpm test:int src/middleware/validation.test.ts`

---

### Step 2: Implement the validation schema types and validator

**File:** `src/middleware/validation.ts`

Implement:
- `ValidationSchema` type with `{ body?, query?, params? }` each containing field definitions
- Field definition: `{ type: 'string'|'number'|'boolean', optional?: boolean, default?: unknown }`
- `validate(schema, request)` function returning either validated data or `ValidationError[]`
- `createValidationMiddleware(schema)` factory returning `(request: NextRequest) => NextResponse`
- On success: attaches `req.validated = { body, query, params }` and calls `NextResponse.next()`
- On failure: returns 400 with `{ errors: ValidationError[] }` where each error has `{ field, message }`

**Verify:** `pnpm test:int src/middleware/validation.test.ts` passes

---

### Step 3: Add `ValidatedRequest` type augmentation for `req.validated`

Extend `NextRequest` (or create wrapper interface) so TypeScript knows about `req.validated`.

**Verify:** `pnpm test:int src/middleware/validation.test.ts`
