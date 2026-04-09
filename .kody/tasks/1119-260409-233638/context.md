
### taskify (2026-04-09T23:39:16)
{
  "task_type": "feature",
  "title": "Add isTokenExpired token checker",
  "description": "Create `src/auth/token-utils.ts` with `isTokenExpired(token: string): boolean` function that decodes a JWT (without signature verification) and checks if the `exp` claim is in the past. Include comprehensive tests covering valid token, expired token, and malformed token cases.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns
...(truncated)

### build (2026-04-09T23:42:27)
The TypeScript errors are pre-existing in the codebase and unrelated to my changes. The implementation is complete.

**Summary:**

Created `src/auth/token-utils.ts` with `isTokenExpired(token: string): boolean` that:
- Decodes JWT without signature verification (using `base64urlDecode`)
- Checks if the `exp` claim is a valid number and is in the past
- Returns `true` for expired/invalid/malformed tokens, `false` for valid unexpired tokens

Created `src/auth/token-utils.test.ts` with 8 tests cove
...(truncated)
