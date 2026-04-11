
### taskify (2026-04-11T16:35:10)
The auth middleware already exists at `src/middleware/auth-middleware.ts` with comprehensive tests covering all the acceptance criteria. The implementation validates JWTs, returns 401 for missing/invalid/expired tokens, and attaches user context.

```json
{
  "task_type": "chore",
  "title": "Verify existing implementation of auth middleware",
  "description": "The auth middleware already exists at src/middleware/auth-middleware.ts with full test coverage. Tests verify: Bearer token extraction, 
...(truncated)

### build (2026-04-11T16:36:23)
**Verification Complete**

The auth middleware at `src/middleware/auth-middleware.ts` is correctly implemented with:

| Acceptance Criteria | Status | Evidence |
|---|---|---|
| Extracts Bearer token from Authorization header | ✅ | Lines 49-54 |
| Verifies JWT signature using secret key | ✅ | Lines 56-62 via `jwtService.verify()` |
| Returns 401 for missing/invalid/expired token | ✅ | Lines 51, 61, 66, 70, 75 |
| Attaches decoded user info to request context | ✅ | Line 78 returns `{ user, sessio
...(truncated)
