
### taskify (2026-04-10T00:47:11)
{
  "task_type": "feature",
  "title": "Add isTokenExpired token utility function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT (without signature verification), extracts the `exp` claim, and returns true if the token is expired. Include co-located tests in `token-utils.test.ts`.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/j
...(truncated)

### build (2026-04-10T00:49:18)
Implementation complete. Here's a summary:

**Created files:**
- `src/auth/token-utils.ts` - `isTokenExpired(token: string): boolean` function that:
  - Splits JWT into 3 parts
  - Returns `true` for malformed tokens
  - Decodes payload via base64url
  - Returns `true` if `exp` claim is missing or token is expired (`payload.exp < now`)

- `src/auth/token-utils.test.ts` - 6 tests covering:
  - Expired token → `true`
  - Valid token with future exp → `false`
  - Malformed tokens (1, 2, or 4+ parts
...(truncated)
