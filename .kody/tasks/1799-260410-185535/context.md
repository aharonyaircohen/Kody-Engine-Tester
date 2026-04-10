
### taskify (2026-04-10T18:58:51)
Now I have enough context. The task asks to create `src/auth/token-utils.ts` with `isTokenExpired(token: string): boolean` that decodes a JWT and checks the `exp` claim. The existing `jwt-service.ts` already has `base64urlDecode` I can reference, and the test pattern follows vitest conventions.

```json
{
  "task_type": "feature",
  "title": "Add token expiry checker utility",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT (witho
...(truncated)

### build (2026-04-10T19:01:14)
Implementation complete. I've created:

1. **`src/auth/token-utils.ts`** — Contains `isTokenExpired(token: string): boolean` that:
   - Splits the JWT token by '.'
   - Base64url decodes the payload (index 1)
   - Parses the JSON and checks if `exp < now` (current Unix timestamp)
   - Returns `true` for invalid/malformed tokens

2. **`src/auth/token-utils.test.ts`** — 4 tests covering:
   - Valid non-expired token → returns `false`
   - Expired token → returns `true`
   - Invalid token format → 
...(truncated)
