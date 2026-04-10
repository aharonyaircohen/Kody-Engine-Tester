
### taskify (2026-04-10T17:54:15)
{
  "task_type": "feature",
  "title": "Add isTokenExpired token-utils.ts",
  "description": "Create `src/auth/token-utils.ts` with `isTokenExpired(token: string): boolean` function that decodes a JWT (without verifying signature) and checks if the `exp` claim is in the past. Include co-located tests in `token-utils.test.ts`.",
  "scope": ["src/auth/token-utils.ts", "src/auth/token-utils.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/jwt-service.ts: base64urlDecode help
...(truncated)

### build (2026-04-10T17:58:38)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/auth/token-utils.ts`** - Contains:
   - `base64urlDecode` helper (mirrors pattern from `jwt-service.ts`)
   - `isTokenExpired(token: string): boolean` - decodes JWT payload (no signature verification) and checks if `exp` claim is in the past

2. **`src/auth/token-utils.test.ts`** - 6 tests covering:
   - Invalid token format (empty, 1-2 parts)
   - Expired token
   - Non-expired token  
   - Token that just expired
   - Ma
...(truncated)
