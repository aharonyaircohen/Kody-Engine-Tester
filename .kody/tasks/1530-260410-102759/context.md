
### taskify (2026-04-10T10:30:47)
{
  "task_type": "feature",
  "title": "Add isTokenExpired utility function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes JWT (without signature verification) and checks the `exp` claim, returning true if the token is expired and false otherwise. Include co-located tests in `src/auth/token-utils.test.ts`.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns
...(truncated)

### build (2026-04-10T10:33:05)
Implementation complete. Summary:

**Created files:**

1. **`src/auth/token-utils.ts`** - Implements `isTokenExpired(token: string): boolean`:
   - Decodes JWT payload (base64url) without signature verification
   - Checks `exp` claim against current Unix timestamp
   - Returns `true` if expired or invalid, `false` if valid

2. **`src/auth/token-utils.test.ts`** - 4 tests:
   - `returns false for a valid non-expired token`
   - `returns true for an expired token`
   - `returns true for a token w
...(truncated)
