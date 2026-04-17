# Plan: Add User Payload Collection with Password Hash Field

## Context

The codebase has dual auth systems: `UserStore` (in-memory, SHA-256) and `AuthService` (PBKDF2, JWT via Payload). A `Users.ts` Payload collection already exists with `auth: true`, which automatically provides:
- `email` field (unique by default when `auth: true`)
- `hash` field (PBKDF2-salted password hash — matches `AuthService`'s expectation)
- `salt` field

The existing tests in `Users.test.ts` cover many fields but are missing two verification points from the acceptance criteria:
1. The auth field (`hash`/`salt`) is present — verifies Payload's built-in password hashing is in use
2. The `email` field has a unique index

Additionally, the role options need to be confirmed/expanded.

---

## Approach

**No structural changes needed** — `Users.ts` already correctly uses `auth: true` (which covers the password field, email uniqueness, and login verification). The plan is to:
1. Update `Users.test.ts` to add the two missing test groups
2. Optionally confirm role expansion with the user

---

## Changes

### File 1: `src/collections/Users.test.ts`

Add two new `describe` blocks:

**`Users fields - email`**
- Test that email field exists and is required (email is added automatically when `auth: true`)

**`Users fields - auth (hash/salt)`**
- Test that the collection has `auth: true` (already present via `Users.auth`)
- The `hash` and `salt` fields are injected by Payload automatically; we can verify they are documented as part of the collection's auth behavior

**`Users fields - role`** *(pending clarification)*
- Keep existing `['admin', 'editor', 'viewer']` options unless user confirms a different set
- Add new role options once confirmed

### Verification

- `pnpm test:int` — all Vitest tests pass
- `pnpm tsc --noEmit` — zero type errors

---

## Decision: Role Values

The existing `role` field keeps options `['admin', 'editor', 'viewer']` — this matches the `RbacRole` type in `AuthService` and all existing tests already cover it. Expanding to additional roles (e.g. `student`, `instructor`, `guest`) would require coordinated changes across `AuthService`, `Courses.ts` access control, and other files, so those are out of scope for this task.

---

## Open Question (deferred)

The task description mentioned a pending role-values question for @aharonyaircohen. No response received in planning. Keeping roles as-is for now.
