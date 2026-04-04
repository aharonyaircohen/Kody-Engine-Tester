
## Existing Patterns Found

- **Middleware factory pattern** (`src/middleware/rate-limiter.ts`, `src/middleware/request-logger.ts`): `createXxxMiddleware(config)` factory returning middleware with attached properties
- **Test colocation** (`src/middleware/*.test.ts`): `*.test.ts` co-located alongside source in same directory
- **Vitest patterns** (`src/middleware/rate-limiter.test.ts`, `src/middleware/request-logger.test.ts`): `describe`/`it`/`expect`/`vi`, `beforeEach`/`afterEach` with `vi.useRealTimers()` cleanup, `vi.useFakeTimers()` for time-based tests
- **Compression**: Node.js built-in `CompressionStream` API (gzip/`br`) — no external dependency needed

## Plan

**Step 1: Write test file for compression middleware**

**File:** `src/middleware/compression.test.ts`
**Change:** Create complete test suite with:
- Unit tests for `createCompressionMiddleware` factory (threshold config, exclude paths, content-type filtering)
- Unit tests for gzip/brotli compression of JSON, HTML, and binary content
- Unit tests for responses below threshold (no compression)
- Unit tests for missing `Accept-Encoding` (no compression applied)
**Verify:** `pnpm test:int -- src/middleware/compression.test.ts`

---

**Step 2: Write compression middleware implementation**

**File:** `src/middleware/compression.ts`
**Change:** Create `createCompressionMiddleware(config)` factory:
- Config interface: `CompressionMiddlewareConfig` with `threshold?: number` (default 1024), `excludePaths?: string[]`, `algorithms?: ('gzip'|'br')[]`
- Detect `Accept-Encoding` header for gzip/brotli support
- Only compress if response body size > threshold
- Only compress compressible content-types (JSON, HTML, text/*, application/*)
- Return middleware `(request: NextRequest) => NextResponse`
**Verify:** `pnpm test:int -- src/middleware/compression.test.ts` passes

---

**Step 3: Verify full test suite**

**Verify:** `pnpm test:int` passes

## Questions

(none — implementation approach is straightforward using Node.js built-in CompressionStream API)
