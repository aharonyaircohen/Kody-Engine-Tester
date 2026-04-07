
### taskify (2026-04-07T21:29:22)
The auth middleware already exists and fully implements all acceptance criteria:

- **JWT extraction/validation**: `src/middleware/auth-middleware.ts:49-54` extracts Bearer token and verifies via `jwtService.verify()`
- **401 responses**: Missing, invalid, expired, malformed, and revoked sessions all return 401
- **Context attachment**: Returns `{ user, session }` with decoded user info
- **Composable**: Factory function `createAuthMiddleware(deps)` pattern — can be applied to any route handler

...(truncated)

### build (2026-04-07T21:32:40)
## Verification Summary

The auth middleware at `src/middleware/auth-middleware.ts` **fully implements** all acceptance criteria:

| Criteria | Status | Implementation |
|----------|--------|----------------|
| Extracts JWT from Bearer header | ✅ | `auth-middleware.ts:49-54` |
| Invalid/missing token → 401 | ✅ | Lines 51 (missing), 61 (invalid) |
| Attaches decoded user to context | ✅ | Line 78: `return { user, session }` |
| Composable factory pattern | ✅ | `createAuthMiddleware(userStore, sess
...(truncated)
