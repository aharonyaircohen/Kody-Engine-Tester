# [Auth] User model with password hash field

**Priority:** high

Ensure Users collection has password hash field for JWT authentication. Users collection at `src/collections/Users.ts` already has `auth:true` with built-in hash/salt fields via Payload's `generatePasswordSaltHash` (PBKDF2, 25000 iterations, sha256, 512 bits).

## Scope
- `src/collections/Users.ts`
- `src/auth/auth-service.ts`

## Test Strategy
- Existing tests: `src/collections/Users.test.ts` covers Users collection behavior
- Existing tests: `src/auth/auth-service.test.ts` covers password verification matching Payload's algorithm
- Verify Users collection `auth: true` config generates password hash field
- Verify `auth-service.ts` `verifyPassword()` matches Payload's `generatePasswordSaltHash` algorithm