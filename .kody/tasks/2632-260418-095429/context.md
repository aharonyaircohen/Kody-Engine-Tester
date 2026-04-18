
### taskify (2026-04-18T10:00:45)
The plan is ready for your review. It covers modifying the existing `Users.ts` collection (removing `auth: true`, adding `passwordHash` with PBKDF2 hooks, expanding roles), creating the barrel export `src/collections/index.ts`, updating `payload.config.ts` to use it, updating `AuthService` to read from `passwordHash`, and adding unit + integration tests.

### build (2026-04-18T10:02:13)
The plan is ready for your review. Here's a summary of what I've designed:

## Plan Summary

**Goal:** Replace Payload CMS `Users` collection's built-in `auth: true` with an explicit `passwordHash` field + PBKDF2 hooks, expand roles, and wire up `AuthService`.

### Key Changes

1. **`src/collections/Users.ts`** — Remove `auth: true`, add `passwordHash` + `passwordSalt` fields with:
   - `beforeChange`: PBKDF2 hash (25k iterations, sha256, 512-bit) — matches `AuthService.verifyPassword`
   - `aft
...(truncated)
