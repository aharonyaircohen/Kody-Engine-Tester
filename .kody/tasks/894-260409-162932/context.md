
### taskify (2026-04-09T16:32:08)
{
  "task_type": "feature",
  "title": "Add isTokenExpired utility function",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT using base64url decoding of the payload and checks if the `exp` claim indicates the token has expired. Include co-located tests in `src/auth/token-utils.test.ts`.",
  "scope": ["src/auth/token-utils.ts", "src/auth/token-utils.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/jwt-servi
...(truncated)

### build (2026-04-09T16:34:18)
The TypeScript errors are all pre-existing issues in `node_modules` and other parts of the codebase, not related to my new files. My implementation is complete:

**Created files:**

1. **`src/auth/token-utils.ts`** - Contains:
   - `TokenPayload` interface with `exp: number`
   - `base64urlDecode` helper function (matching the pattern from `jwt-service.ts`)
   - `isTokenExpired(token: string): boolean` function that decodes JWT payload and checks if `exp < now`

2. **`src/auth/token-utils.test.t
...(truncated)

### autofix (2026-04-09T16:35:51)
Done. Changed `let context` to `const context` at line 80 in `src/utils/logger/index.ts`. Since `context` is only assigned once and never reassigned, `const` is the correct choice.

