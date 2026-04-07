# [Auth] Login and register endpoints

**Priority:** high
**Depends on:** [Auth] User model with password hash field

Add `/login` and `/register` endpoints. Existing implementations: `src/api/auth/login.ts` uses UserStore (SHA-256) while `src/api/auth/register.ts` uses AuthService (PBKDF2). Recommend standardizing on AuthService per `src/auth/auth-service.ts` pattern.

## Scope
- `src/api/auth/login.ts`
- `src/api/auth/register.ts`
- `src/auth/auth-service.ts`

## Questions
- Should `login.ts` be refactored to use AuthService instead of UserStore for consistent PBKDF2 hashing?

## Test Strategy
- Existing tests: `src/api/auth/login.test.ts` covers login endpoint behavior
- Existing tests: `src/api/auth/register.test.ts` covers register endpoint behavior
- Verify login accepts email/password and returns JWT on success
- Verify register creates user with hashed password
- Verify login with invalid credentials returns 401