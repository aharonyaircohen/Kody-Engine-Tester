
### taskify (2026-04-10T17:23:42)
```json
{
  "task_type": "chore",
  "title": "Verify existing implementation of isTokenExpired",
  "description": "The isTokenExpired(token: string): boolean function already exists in src/auth/token-utils.ts with 3 passing tests covering: valid non-expired tokens, expired tokens, and malformed tokens. No additional work needed.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/token-utils.ts - Manu
...(truncated)

### build (2026-04-10T17:25:22)
**Verification complete.** The `isTokenExpired` function already exists and works correctly:

**Implementation** (`src/auth/token-utils.ts`):
- Decodes JWT using base64url decode
- Parses the payload JSON
- Checks if `payload.exp < now` (current timestamp in seconds)
- Returns `true` for malformed/invalid tokens or errors

**Tests** (`src/auth/token-utils.test.ts`) - 3 tests, all passing:
1. `should return false for a valid non-expired token`
2. `should return true for an expired token`
3. `shou
...(truncated)
