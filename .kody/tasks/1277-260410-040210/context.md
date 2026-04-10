
### taskify (2026-04-10T04:05:08)
{
  "task_type": "feature",
  "title": "Add isTokenExpired utility function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT using base64url decoding and checks if the `exp` claim is in the past. Should return `true` if expired, `false` otherwise. Include co-located tests in `src/auth/token-utils.test.ts` following the vitest pattern used in the auth directory.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-uti
...(truncated)

### build (2026-04-10T04:07:37)
Implementation complete. Here's a summary:

**Created `src/auth/token-utils.ts`**:
- `isTokenExpired(token: string): boolean` function
- Decodes JWT using base64url decoding (same pattern as `jwt-service.ts`)
- Returns `true` if token is expired or malformed, `false` if valid and not expired

**Created `src/auth/token-utils.test.ts`**:
- 4 tests covering: valid non-expired token, expired token, invalid format, and malformed token
- All 4 tests pass

No type errors in the new files.

