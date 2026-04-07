
### taskify (2026-04-07T19:38:13)
Implementation complete. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add isTokenExpired function",
  "description": "Created `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT and checks the `exp` claim against the current timestamp. Returns true if token is expired or invalid, false if valid and not expired. Includes 12 comprehensive tests covering valid tokens, expired tokens, invalid formats, malformed tokens, missing 
...(truncated)

### build (2026-04-07T19:39:56)
**Verification complete.** The implementation already exists and is fully functional:

**`src/auth/token-utils.ts`** - `isTokenExpired(token: string): boolean`:
- Decodes JWT using base64url decoding
- Validates 3-part JWT structure
- Checks `exp` claim is a number
- Returns `true` if token is expired or invalid, `false` if valid and not expired

**`src/auth/token-utils.test.ts`** - 12 comprehensive tests covering:
- Valid non-expired tokens
- Expired tokens
- Manual payload construction (both p
...(truncated)
