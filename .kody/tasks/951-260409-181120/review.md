## Verdict: PASS

## Summary

Added two new POST route handlers: `/api/auth/login` and `/api/auth/register`. Login uses the existing in-memory `UserStore`/`SessionStore`/`JwtService` pattern; register uses `AuthService` via Payload. Both return proper status codes (200/201/400/401/409) and JWT tokens. All 10 auth route tests pass. The build failure and integration test failure are pre-existing issues unrelated to these changes.

## Findings

### Critical

None.

### Major

None.

### Minor

- **`src/app/api/auth/login/route.ts:14`** — `await userStore.ready` at module level is an import-time side effect. In Next.js App Router with Turbopack, module-level awaits run once at cold start. If `userStore.ready` rejects, the entire module fails to load. Consider initializing in a wrapper or moving readiness check into the handler.
  > *Note: This is how the existing codebase patterns work (module-level singletons), so it's consistent. Worth monitoring in production.*

- **`src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts`** — Both routes call `request.json()` without a dedicated try-catch for `SyntaxError` (malformed JSON). A malformed body throws a generic `SyntaxError` which is caught by the general catch block and returned as 500. Should explicitly catch and return 400 for JSON parse failures.
  > *Suggested fix: Add `try { const body = await request.json() } catch (e) { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }` before destructuring.*

### Test Gaps

None — all 10 auth route tests pass (4 login + 6 register). The `tests/int/api.int.spec.ts` failure is pre-existing (requires a live PostgreSQL instance).

## Two-Pass Review

**Pass 1 — CRITICAL:** No critical issues found. Routes use parameterized validation via underlying service functions, no SQL injection risk, no shell execution, no unsafe HTML rendering.

**Pass 2 — INFORMATIONAL:** Minor JSON parse error handling gap noted above. Build failure (`src/pages/board/modal` missing default export) and integration spec failure are pre-existing and unrelated to these changes.
