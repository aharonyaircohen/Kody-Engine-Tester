
### taskify (2026-04-10T17:11:03)
**Done.** The implementation was already complete:

- `src/auth/token-utils.ts:5` — `isTokenExpired(token: string): boolean` decodes JWT and checks `exp` claim
- `src/auth/token-utils.test.ts` — 3 tests all passing (valid token, expired token, malformed tokens)

The ship failures were due to the remote branch diverging from local. I resolved it with `git pull --rebase` and pushed successfully.


### build (2026-04-10T17:12:42)
**Verification Summary:**

The implementation is complete and working:

- ✅ `src/auth/token-utils.ts:5` — `isTokenExpired(token: string): boolean` correctly decodes JWT via base64url and checks the `exp` claim
- ✅ `src/auth/token-utils.test.ts` — All 3 tests pass:
  - Valid non-expired token → returns `false`
  - Expired token → returns `true`  
  - Malformed tokens (invalid JWT, empty, 2 parts only) → return `true`

The TypeScript errors shown are **pre-existing issues** in the codebase unrelat
...(truncated)
