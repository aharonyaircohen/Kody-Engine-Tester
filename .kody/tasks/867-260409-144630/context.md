
### taskify (2026-04-09T14:49:56)
All 4 tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add isTokenExpired token utility function",
  "description": "Create isTokenExpired(token: string): boolean in src/auth/token-utils.ts that decodes a JWT (without signature verification), extracts the exp claim, and returns true if the token has expired. Includes comprehensive tests covering valid tokens, expired tokens, malformed tokens, and missing exp claims.",
  "scope": ["src/auth/token-utils.ts", 
...(truncated)

### build (2026-04-09T14:51:37)
**Verification complete.** The implementation is confirmed:

**`src/auth/token-utils.ts`** - `isTokenExpired(token: string): boolean`
- Decodes JWT using base64url
- Validates 3-part JWT structure
- Checks `exp` claim against current timestamp
- Returns `true` for malformed/missing exp tokens, `true` if expired, `false` if valid

**`src/auth/token-utils.test.ts`** - 4 tests, all passing:
- ✓ Valid non-expired token → `false`
- ✓ Expired token → `true`  
- ✓ Malformed tokens (invalid structure) →
...(truncated)
