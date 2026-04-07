
### taskify (2026-04-07T20:24:03)
{
  "task_type": "feature",
  "title": "Add token expiry checker utility",
  "description": "Create `isTokenExpired(token: string): boolean` in `src/auth/token-utils.ts` that decodes a JWT using base64url decoding and checks if the `exp` claim indicates the token has expired. Include comprehensive tests covering expired tokens, valid tokens, and malformed tokens.",
  "scope": [
    "src/auth/token-utils.ts",
    "src/auth/token-utils.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [

...(truncated)

### build (2026-04-07T20:29:28)
All tests pass. Here's a summary of the implementation:

**Created `src/auth/token-utils.ts`:**
```typescript
export function isTokenExpired(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) return true
  try {
    const payload = JSON.parse(base64urlDecode(parts[1])) as { exp?: number }
    if (typeof payload.exp !== 'number') return true
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true
  }
}
```

**Created
...(truncated)
