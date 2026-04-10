
### taskify (2026-04-10T13:37:52)
All 5 tests pass. Created:

**`src/auth/token-utils.ts`** - `isTokenExpired(token: string): boolean` that:
- Decodes the JWT payload (base64url)
- Checks if `exp` claim exists and is greater than current Unix timestamp
- Returns `true` for invalid/malformed tokens

**`src/auth/token-utils.test.ts`** - 5 tests covering:
- Valid non-expired token → `false`
- Expired token → `true`
- Invalid format tokens → `true`
- Missing `exp` claim → `true`
- Valid refresh token → `false`


### build (2026-04-10T13:39:25)
All 5 tests pass. The task is verified complete:

**Implementation** (`src/auth/token-utils.ts`):
- `isTokenExpired(token: string): boolean` function
- Decodes JWT payload using base64url decoding
- Checks if `exp` claim exists and compares against current Unix timestamp
- Returns `true` for invalid/malformed tokens
- Returns `false` for valid non-expired tokens

**Tests** (`src/auth/token-utils.test.ts`):
- ✓ Valid non-expired token → `false`
- ✓ Expired token → `true`
- ✓ Invalid format → `tru
...(truncated)
