
### taskify (2026-04-10T13:18:03)
{
  "task_type": "feature",
  "title": "Add passwordHash field to User model with validation",
  "description": "Add a passwordHash field to the Payload Users collection that stores bcrypt/argon2 hashes, with email format validation and access control to exclude the hash from API responses. The Users collection already has auth:true which provides email field, but needs an explicit passwordHash field with proper validation and hidden access.",
  "scope": [
    "src/collections/Users.ts",
    "sr
...(truncated)

### plan (2026-04-10T13:18:38)
## Pattern Discovery

I searched for how similar features are implemented:
- `src/collections/Users.ts` — Payload collection with `auth: true` which provides email/hash/salt fields automatically
- `src/auth/auth-service.ts` — verifies passwords using `hash` and `salt` fields (Payload built-in auth)
- `src/collections/Users.test.ts` — field-level tests using `findField` helper and mock req patterns

**Key finding**: Payload's built-in `auth: true` already provides `email`, `hash`, and `salt` fiel
...(truncated)

### build (2026-04-10T13:22:13)
The implementation is complete. Let me provide a summary of what was done:

## Summary

**Added `passwordHash` field to Users collection** (`src/collections/Users.ts:149-158`):

```typescript
{
  name: 'passwordHash',
  type: 'text',
  required: false,
  hidden: true,
  access: {
    read: () => false,
    create: () => true,
    update: () => false,
  },
},
```

**Key properties:**
- `hidden: true` - hides from Payload admin UI
- `access.read: () => false` - never exposed in API responses
- `ac
...(truncated)

### autofix (2026-04-10T13:24:51)
That's just a warning, not an error. The `let context` → `const context` fix is complete. The remaining lint errors are pre-existing issues in unrelated files (edit page, auth files) and not caused by this task.


### review (2026-04-10T13:30:49)
## Verdict: PASS

## Summary

Added a `passwordHash` text field to the Payload Users collection with `hidden: true` and `access: { read: () => false, create: () => true, update: () => false }` to ensure the password hash is never exposed in API responses. Unit tests (43 total) verify the field properties and access control. All tests pass.

## Findings

### Critical

None.

### Major

None.

### Minor

`src/utils/logger/index.ts:80` — Unrelated `let` → `const` change for `context`. While valid (
...(truncated)
