
### taskify (2026-04-10T11:26:55)
All tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add isTokenExpired token utility function",
  "description": "Create isTokenExpired(token: string): boolean in src/auth/token-utils.ts that decodes JWT and checks the exp claim. Returns true if token is expired or invalid, false otherwise. Includes comprehensive tests covering expired tokens, non-expired tokens, malformed tokens, and tokens missing the exp claim.",
  "scope": [
    "src/auth/token-utils.t
...(truncated)

### build (2026-04-10T11:28:39)
The TypeScript errors are pre-existing in the codebase (unrelated to `token-utils`). The implementation is verified:

**Verification Summary:**

| Check | Result |
|-------|--------|
| `isTokenExpired(token: string): boolean` exists | ✅ |
| Decodes JWT and checks `exp` claim | ✅ |
| Tests cover: valid tokens, expired tokens, invalid formats, malformed tokens, tokens without exp | ✅ |
| All 5 tests pass | ✅ |

**Implementation Details:**
- `src/auth/token-utils.ts:5-20` — function decodes the JWT
...(truncated)
