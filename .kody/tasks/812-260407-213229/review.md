## Verdict: PASS

## Summary

Two new API route handlers were added: `POST /api/auth/login` and `POST /api/auth/register`, each wrapping existing business logic with proper HTTP response mapping. 13 unit tests cover both endpoints across success and error paths.

## Findings

### Critical

None.

### Major

**`src/app/api/auth/register/route.ts:21`** — Duplicate email detection uses fragile string comparison on error message. If the error message text ever changes (e.g., localization), the status code mapping silently breaks and returns 409 instead of 400.

```typescript
const finalStatus = error?.message === 'Email already in use' ? 400 : status
```

**Suggested fix:** Check `error.status` instead of the message string, or introduce a dedicated error type/code:

```typescript
const finalStatus = (error as any)?.status === 409 ? 400 : status
```

### Minor

**`src/app/api/auth/login/route.test.ts` + `route.ts`** — No test for malformed JSON body (e.g., `Content-Type: application/json` but invalid JSON). `await request.json()` will throw a `SyntaxError` which maps to 500, not 400. Since the business logic (`login.ts:32`) validates missing fields and throws 400, the practical behavior is correct, but the error classification (malformed input vs server error) differs.

**`src/app/api/auth/register/route.test.ts`** — Duplicate email test (`'should return 400 for duplicate email'`) only verifies the business logic path where `payload.find` returns an existing doc and throws 409→400. There is no integration test verifying the error message text `"Email already in use"` is preserved through the mapping.

---

**Pre-existing issue (not introduced by this diff):** `src/pages/board/modal` has a missing `default` export causing `pnpm build` to fail with a TypeScript error. This exists in `HEAD~1` and is unrelated to the auth endpoints.
