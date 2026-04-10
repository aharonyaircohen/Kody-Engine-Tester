
### taskify (2026-04-10T16:28:56)
```json
{
  "task_type": "feature",
  "title": "Add token expiry checker",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT and checks the `exp` claim. Should return `true` if expired, `false` otherwise. Include co-located tests in `src/auth/token-utils.test.ts`.",
  "scope": ["src/auth/token-utils.ts", "src/auth/token-utils.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/jwt-service.ts:13-21 — base64urlEnc
...(truncated)

### build (2026-04-10T16:31:27)
The implementation is complete. Here's a summary:

## Created Files

**`src/auth/token-utils.ts`**
- `isTokenExpired(token: string): boolean` - Decodes JWT payload and checks `exp` claim
- Returns `true` if token is expired or invalid, `false` if valid
- Uses the same `base64urlDecode` pattern from `jwt-service.ts`

**`src/auth/token-utils.test.ts`**
- 8 tests covering: expired tokens, valid tokens, boundary cases, malformed tokens, and various expiry windows

## Test Results

All 8 tests pass:

...(truncated)
