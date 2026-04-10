
### taskify (2026-04-10T12:48:27)
{
  "task_type": "feature",
  "title": "Add isTokenExpired function to token-utils.ts",
  "description": "Create a standalone `isTokenExpired(token: string): boolean` function in `src/auth/token-utils.ts` that decodes a JWT (without signature verification) and checks if the `exp` claim indicates the token is expired. Include comprehensive tests in `token-utils.test.ts`.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patter
...(truncated)

### build (2026-04-10T12:51:59)
## Summary

I've implemented the `isTokenExpired` function as requested:

**Created `src/auth/token-utils.ts`:**
- `isTokenExpired(token: string): boolean` - Decodes a JWT (without signature verification) and checks if the `exp` claim indicates the token is expired
- `base64urlDecode` helper function (consistent with the pattern in `jwt-service.ts`)
- `DecodedToken` interface for type-safe payload decoding

**Created `src/auth/token-utils.test.ts` with 12 comprehensive tests:**
- Valid non-expir
...(truncated)
