## Existing Patterns Found

- **Factory middleware pattern** (`src/middleware/request-logger.ts`, `src/middleware/rate-limiter.ts`): Returns an object with a `middleware` function; uses `NextRequest`/`NextResponse`; attaches headers to response
- **Test pattern** (`src/middleware/request-logger.test.ts`): Uses `makeRequest` helper, `vi.useFakeTimers()`, custom logger spy injection

---

## Step 1: Create test file for log-context middleware

**File:** `src/middleware/log-context.test.ts`
**Change:** Write comprehensive tests covering:
- Normal requests (verifies request ID is UUID, timestamp is number, `x-request-id` header present, `req.locals` populated)
- Missing headers (middleware works without any incoming headers)
- Concurrent requests (each gets unique ID, no collisions)
**Verify:** `pnpm test:int src/middleware/log-context.test.ts`

---

## Step 2: Create log-context middleware

**File:** `src/middleware/log-context.ts`
**Change:** Implement `createLogContextMiddleware()` factory that:
- Generates `crypto.randomUUID()` for request ID
- Captures `Date.now()` for timestamp
- Attaches `{ requestId, timestamp }` to `req.locals` (cast `request` to `NextRequest & { locals: Record<string, unknown> }`)
- Adds lowercase `x-request-id` header to `NextResponse`
- Returns `{ middleware, requestId, timestamp }` interface
**Verify:** `pnpm test:int src/middleware/log-context.test.ts` passes

---

## Questions

None — requirements are clear and patterns are well-established.
