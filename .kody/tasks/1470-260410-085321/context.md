
### taskify (2026-04-10T08:58:14)
{
  "task_type": "feature",
  "title": "Add isTokenExpired token utils function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT (without signature verification) and checks if the exp claim indicates the token is expired. Include co-located tests in `src/auth/token-utils.test.ts`.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/jwt
...(truncated)

### build (2026-04-10T09:02:49)
Implementation complete. Here's what was created:

## Summary

**Created `src/auth/token-utils.ts`:**
- `isTokenExpired(token: string): boolean` - decodes JWT (without signature verification) and checks if `exp` claim indicates the token is expired
- Uses `base64urlDecode` (same pattern as `jwt-service.ts`)
- Returns `true` for expired/invalid tokens, `false` for valid tokens
- Handles edge cases: invalid format, missing exp, malformed JSON

**Created `src/auth/token-utils.test.ts`:**
- 7 tests 
...(truncated)
