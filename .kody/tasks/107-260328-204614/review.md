Now I have a complete picture. Let me produce the structured review.

## Verdict: PASS

## Summary
New `src/middleware/pipeline.ts` composes `createAuthMiddleware` and `requireRole` into reusable route factories (`createAuthenticatedRoute`, `createInstructorRoute`, `createAdminRoute`, `createPublicRoute`). `RoleError` is exported from `role-guard.ts`. All existing middleware behavior is preserved; the diff touches no auth logic.

## Findings

### Critical
None.

### Major
`src/middleware/pipeline.ts:205` — `createPublicRoute` takes an empty middleware array, so no rate limiting is applied to public routes. The task specification explicitly lists `publicRoute` as **(rate limit only)**, meaning public endpoints should still be protected by `SlidingWindowRateLimiter`. The rate limiter that lives inside `createAuthMiddleware` is not available here since auth is intentionally absent. Either:
1. Add `createRateLimiterMiddleware` to the `createPublicRoute` pipeline, or
2. Document the deviation explicitly so callers know public routes have no rate-limit guard in this API.

`src/middleware/pipeline.ts:151` — Unchecked type cast:
```ts
return handler(result as T)
```
`result` is `PipelineContext`; casting it to `T` (which may require `user: User` or other properties) is not validated. If a pipeline middleware fails to add required properties, the handler receives a context with wrong shape at runtime — TypeScript would not catch it. Consider narrowing `result` before passing it, or adding a runtime guard that validates required context keys match `T`.

### Minor
`src/middleware/role-guard.ts:7` — `RoleError` is now exported. This is a minor API addition (not a behavioral change) — existing consumers are unaffected.

`src/middleware/pipeline.ts:80-81` — IP extraction uses `as unknown as { ip?: string }` to access `request.ip`. This is a Next.js internal property not on the public `NextRequest` type. Works correctly but is fragile; worth a comment explaining why the cast is necessary.
