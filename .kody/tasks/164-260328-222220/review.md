All inline Response patterns are gone from the API routes.

## Verdict: PASS

## Summary
Extracted duplicated `new Response(JSON.stringify(...), { headers: {...} })` patterns into two reusable helpers (`createErrorResponse`, `createJsonResponse`) in `src/utils/api-response.ts`, with 9 tests covering status codes, headers, and body serialization. Five API route files were updated to use these helpers.

## Findings

### Critical
None.

### Major
None.

### Minor
None.

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety
No SQL operations in this diff.

### Race Conditions & Concurrency
No concurrency concerns — pure helper functions with no shared state.

### LLM Output Trust Boundary
N/A — these are internal utility functions, not LLM outputs.

### Shell Injection
None.

### Enum & Value Completeness
No enums introduced. `status` is a plain `number` parameter, which is correct since Next.js `Response` accepts any numeric status code.

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects
`csrf-token/route.ts:15` — `createJsonResponse({ token }, 200, { 'X-CSRF-Token': token })` — the explicit `200` is redundant since 200 is already the default. Not a bug, just noise.

### Test Gaps
None. The 9 tests cover status codes, Content-Type header, and both object and array body serialization for both functions.

### Dead Code & Consistency
None.

### Crypto & Entropy
N/A.

### Performance & Bundle Impact
None — two tiny functions replacing duplicated code, reducing bundle size.

### Type Coercion at Boundaries
`createJsonResponse` accepts `unknown` for `data` and passes it to `JSON.stringify` — correct. `createErrorResponse` accepts `string` for the message — correct.

## Notes
- All 9 tests pass (`pnpm vitest run src/utils/api-response.test.ts`)
- No type errors in any of the 7 changed files (`pnpm tsc --noEmit`)
- The pre-existing type errors in `Lessons.test.ts`, `auth-context.test.tsx`, `event-emitter.ts`, and `pipe.test.ts` are unrelated to this task
