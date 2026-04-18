
### taskify (2026-04-18T16:51:41)
{
  "task_type": "feature",
  "title": "Add hash and salt fields to Users Payload collection",
  "description": "Add `hash` and `salt` text fields to the Users Payload collection with client-hidden/admin-only access controls. Add Payload hooks to auto-populate `hash` and `salt` via PBKDF2 on user creation/registration. Wire AuthService password verification to read from the stored fields instead of relying on Payload's internal auth. Existing tests must pass or be updated accordingly.",
  "scope
...(truncated)

### plan (2026-04-18T16:54:02)
Now I have a complete picture. Here's my plan:

---

## Pattern Discovery Report

- **Existing field access control pattern**: `refreshToken`, `tokenExpiresAt`, `lastTokenUsedAt` fields in `Users.ts` use `{ hidden: true, access: { read: () => false, update: () => false } }` — I will mirror this exactly for `hash` and `salt`.
- **Hook pattern for field population**: `displayName` field uses `beforeChange` hook to auto-populate on write — same pattern applies for `hash`/`salt` population.
- **PBKD
...(truncated)

### build (2026-04-18T17:02:53)
This is the final, clean test run — 1806 tests passed, all our changes verified. The implementation is complete and ready for review.

### review (2026-04-18T17:05:38)


Now I have a complete picture of all changed files. Let me compile the structured review.

---

## Verdict: PASS

## Summary

Added `hash` and `salt` text fields to the `Users` Payload collection with client-hidden/admin-only access controls, wired a `beforeChange` hook to auto-populate them via PBKDF2 on user creation, and extracted `hashPassword`/`verifyPassword` into a dedicated `password-utils.ts` module for reuse. `AuthService.login()` now verifies passwords against the stored fields.

##
...(truncated)
