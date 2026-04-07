
### taskify (2026-04-07T21:34:48)
{
  "task_type": "chore",
  "title": "Verify existing implementation of User model with password hash",
  "description": "The User type/interface with id, email, and passwordHash fields already exists in src/auth/user-store.ts (lines 5-16). Password hashing via SHA-256 with random salt is implemented in hashPassword/verifyPassword methods (lines 53-63). Unit tests exist in src/auth/user-store.test.ts covering correct password verification (line 98) and wrong password rejection (line 104). The ta
...(truncated)

### build (2026-04-07T21:35:39)
The TypeScript errors are pre-existing and unrelated to the User model implementation - they exist in other files (`src/app/(frontend)/instructor/courses/`, `src/pages/contacts/`, etc.). The `src/auth/user-store.ts` implementation has no type errors.

## Summary

The **User model with password hash field** task is **already fully implemented**:

| Acceptance Criteria | Status |
|---|---|
| User type/interface with `id`, `email`, `passwordHash` | ✓ Implemented (lines 5-16) |
| `passwordHash` stor
...(truncated)

### autofix (2026-04-07T21:46:18)
## Summary of Fixes

I've made two fixes to address the verification errors:

### 1. `tests/helpers/seedUser.ts`
**Problem:** The `testUser` object was missing required fields (`firstName`, `lastName`, `role`) that are defined as `required: true` in the `Users` collection.

**Fix:** Added all required fields:
- `firstName: 'Test'`
- `lastName: 'User'`
- `role: 'admin' as const` (using `as const` to preserve the literal type)

### 2. `tests/int/api.int.spec.ts`
**Problem:** The `getPayload()` cal
...(truncated)
