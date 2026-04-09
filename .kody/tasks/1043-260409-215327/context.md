
### taskify (2026-04-09T21:56:28)
```json
{
  "task_type": "feature",
  "title": "Add isTokenExpired token-utils function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT (without verifying signature) and checks if the `exp` claim is in the past. Include co-located tests in `src/auth/token-utils.test.ts`.",
  "scope": ["src/auth/token-utils.ts", "src/auth/token-utils.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/jwt-service.ts: base64ur
...(truncated)

### build (2026-04-09T21:59:54)
**Task complete.** I've implemented `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts`:

- Decodes JWT body using base64url (without signature verification, matching the existing `base64urlDecode` pattern in `jwt-service.ts`)
- Checks if `exp` claim is in the past
- Returns `true` for expired/invalid/malformed tokens

**Tests in `src/auth/token-utils.test.ts` (4/4 passing):**
- Returns `false` for valid non-expired token
- Returns `true` for expired token  
- Returns `true` fo
...(truncated)
