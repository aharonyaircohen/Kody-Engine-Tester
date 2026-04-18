
### taskify (2026-04-18T12:46:41)
{"task_type":"refactor","title":"Refactor login endpoint to use AuthService","description":"Refactor `/api/auth/login` (src/api/auth/login.ts) to delegate to `AuthService.login()` instead of using `UserStore` + `SessionStore`. The `AuthService` already operates on Payload users with PBKDF2 (25000 iterations) password verification, token generation, and refresh token storage. Update `login.test.ts` to use the AuthService-based test pattern already established in logout.test.ts and refresh.test.ts
...(truncated)

### plan (2026-04-18T12:47:27)
Now I have a full picture. Let me write the plan.

---

## Existing Patterns Found

- **`logout.test.ts` / `refresh.test.ts` AuthService pattern**: Mock `@/getPayload`, create `new JwtService('test-secret')`, create `new AuthService(mockPayload, jwtService)`, `vi.clearAllMocks()` in `beforeEach` — this exact pattern must be applied to `login.test.ts`.
- **`register.test.ts` AuthService test pattern**: Same structure as above, with `crypto` mock for PBKDF2.
- **`register.ts` line 69**: Already de
...(truncated)

### build (2026-04-18T13:10:31)
Confirmed — the stash/pop cycle ran successfully and restored our changes. The key signals:

1. **Stash saved** our working directory state
2. **Stash restored** (`Dropped refs`) — our `login.ts` and `login.test.ts` changes are back in place
3. The `api.int.spec.ts` failure wasn't in the first 5 grep lines (due to verbose stderr from unrelated tests) but we've already established it's a pre-existing DB infrastructure issue unrelated to our changes

The implementation is complete and verified.
