
### taskify (2026-04-10T14:40:45)
```json
{
  "task_type": "feature",
  "title": "Add isTokenExpired token checker",
  "description": "Create `src/auth/token-utils.ts` with `isTokenExpired(token: string): boolean` function that decodes a JWT using base64url decoding and checks if the `exp` claim is in the past. Include co-located tests in `src/auth/token-utils.test.ts`.",
  "scope": ["src/auth/token-utils.ts", "src/auth/token-utils.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/jwt-service.ts:23-93 — JW
...(truncated)

### build (2026-04-10T14:45:02)
Done. I've created:

**`src/auth/token-utils.ts`** - with `isTokenExpired(token: string): boolean` that:
- Decodes JWT using base64url decoding (following the pattern from `jwt-service.ts`)
- Validates the token has 3 parts
- Checks if `exp` claim is a number and in the past
- Returns `true` for expired/invalid tokens, `false` for valid non-expired tokens

**`src/auth/token-utils.test.ts`** - with 6 tests covering:
- Valid non-expired access token → `false`
- Already-expired token → `true`  
- V
...(truncated)
