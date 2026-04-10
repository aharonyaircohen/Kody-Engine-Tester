
### taskify (2026-04-10T06:29:42)
Now I have a complete picture. The task requires:
1. Creating `src/auth/token-utils.ts` with `isTokenExpired(token: string): boolean`
2. Creating co-located tests `src/auth/token-utils.test.ts`
3. Reusing the base64url decode pattern from `jwt-service.ts`

```json
{
  "task_type": "feature",
  "title": "Add isTokenExpired utility function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT by base64url-decoding the payload and check
...(truncated)

### build (2026-04-10T06:32:22)
The implementation is complete. All 6 `token-utils` tests pass. The 1 failed test file and database errors are pre-existing (pg/drizzle connectivity issues unrelated to my changes).

**Summary:**

Created `src/auth/token-utils.ts` with `isTokenExpired(token: string): boolean` that:
- Decodes JWT payload using base64url decoding (reusing pattern from `jwt-service.ts`)
- Checks if `exp` claim is in the past
- Returns `true` for expired/malformed/missing-exp tokens, `false` for valid tokens with fu
...(truncated)
