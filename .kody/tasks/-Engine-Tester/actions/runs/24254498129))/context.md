
### taskify (2026-04-10T17:17:27)
The implementation is complete. Here's the status:

**Implementation:** `src/auth/token-utils.ts` contains `isTokenExpired(token: string): boolean` that:
- Decodes the JWT payload using base64url decoding
- Checks the `exp` claim against current Unix timestamp
- Returns `true` if expired or malformed, `false` otherwise

**Tests:** `src/auth/token-utils.test.ts` - all 3 tests pass:
- Valid non-expired token returns `false`
- Expired token returns `true`  
- Malformed tokens return `true`

The bra
...(truncated)

### build (2026-04-10T17:19:19)
The implementation is verified. The TypeScript errors are pre-existing and unrelated to `token-utils.ts`.

## Verification Summary

**`src/auth/token-utils.ts`** - Implementation is correct:
- Decodes JWT payload using base64url decoding
- Checks `exp` claim against current Unix timestamp
- Returns `true` if expired or malformed, `false` otherwise

**`src/auth/token-utils.test.ts`** - All 3 tests pass:
- ✓ Valid non-expired token → `false`
- ✓ Expired token → `true`  
- ✓ Malformed tokens → `tru
...(truncated)
