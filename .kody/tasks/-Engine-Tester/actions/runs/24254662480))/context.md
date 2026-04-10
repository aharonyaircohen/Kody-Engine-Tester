
### taskify (2026-04-10T17:28:59)
The task is already implemented. The push succeeded. Here's the classification:

```json
{
  "task_type": "chore",
  "title": "Verify existing implementation of isTokenExpired",
  "description": "The isTokenExpired(token: string): boolean function already exists in src/auth/token-utils.ts. It decodes JWT using base64url and checks the exp claim against current timestamp. Tests already exist in token-utils.test.ts covering: valid non-expired tokens, expired tokens, and malformed tokens.",
  "scop
...(truncated)

### build (2026-04-10T17:30:42)
The `isTokenExpired` implementation is already complete and verified:

**Summary:**

1. **`src/auth/token-utils.ts`** - Function exists and correctly:
   - Splits JWT into 3 parts
   - Decodes the payload using base64url
   - Compares `exp` claim against current Unix timestamp
   - Returns `true` for malformed/invalid tokens

2. **`src/auth/token-utils.test.ts`** - 3 tests exist covering:
   - Valid non-expired token → returns `false`
   - Expired token → returns `true`
   - Malformed tokens → r
...(truncated)
