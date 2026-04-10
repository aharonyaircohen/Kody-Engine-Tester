
### taskify (2026-04-10T16:59:15)
```json
{
  "task_type": "feature",
  "title": "Add isTokenExpired utility function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT (base64url decode the payload), extracts the `exp` claim, and returns `true` if the token is expired (exp < current Unix timestamp), `false` otherwise. Include co-located tests in `token-utils.test.ts` covering: valid non-expired token, expired token, and malformed token input.",
  "scope": ["src/au
...(truncated)

### build (2026-04-10T17:01:35)
Implementation complete. Here's what was created:

**`src/auth/token-utils.ts`** - Contains `isTokenExpired(token: string): boolean` that:
- Decodes the JWT payload using base64url decoding
- Extracts the `exp` claim
- Returns `true` if expired (`exp < now`), `false` otherwise
- Handles malformed tokens gracefully by returning `true`

**`src/auth/token-utils.test.ts`** - Tests covering:
- Valid non-expired token → returns `false`
- Expired token → returns `true`
- Malformed tokens (`'not-a-valid
...(truncated)
