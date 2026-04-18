
### taskify (2026-04-18T16:53:30)
I now have a thorough understanding of the codebase. Let me synthesize the findings and produce the classification JSON.

**Key findings from exploration:**
- `src/auth/withAuth.ts` — HOC wrapping 15 routes, returns 401 on missing/invalid tokens, 403 on insufficient roles
- `src/auth/auth-service.ts` — AuthService with `login`, `refresh`, `verifyAccessToken`, `logout` using PBKDF2
- `src/auth/jwt-service.ts` — JWT signing/verification with token blacklisting
- `src/api/auth/{login,logout,refresh
...(truncated)

### plan (2026-04-18T16:54:49)


I have enough context. Let me write the plan.

## Existing Patterns Found

- **`vi.mock('@/getPayload')`**: Used in `register.test.ts`, `refresh.test.ts`, `logout.test.ts` — mock Payload instance for AuthService tests
- **`makeAuthenticatedContext()` helper**: Creates user + tokens + sessions for test context
- **`vi.clearAllMocks()` pattern**: Used in `beforeEach` across all auth tests
- **`JwtService.signAccessToken()` / `signRefreshToken()`**: Used to create real JWTs for testing token flow
...(truncated)

### build (2026-04-18T17:59:21)


Both auth test files now pass (31 tests total). Here's a summary of what was fixed:

**Fixes applied:**

1. **`tests/int/auth-protected-routes.int.spec.ts`** — two fixes:
   - Added crypto mock (`vi.mock('crypto', ...)`) before imports so `AuthService.login` can verify passwords during the full auth flow test
   - Corrected assertion from `body.error === 'Invalid token'` → `'User not found'` (actual error thrown when token is cryptographically valid but user doesn't exist in DB)

2. **`src/aut
...(truncated)
