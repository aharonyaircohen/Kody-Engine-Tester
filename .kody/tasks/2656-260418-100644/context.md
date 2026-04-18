
### taskify (2026-04-18T10:09:58)
The task directory contains only metadata — the referenced codebase (`src/collections/`, `src/auth/`, etc.) doesn't exist yet. Classification is fully derivable from the task description and the Project Memory patterns documented in the prompt. Here is the output:

---

```json
{
  "task_type": "feature",
  "title": "Add User Payload collection with PBKDF2 password hash field",
  "description": "Define a User Payload collection in src/collections/User.ts with: email field (unique, for login iden
...(truncated)

### plan (2026-04-18T10:15:35)
The plan is ready for your review at `/home/runner/.claude/plans/ancient-splashing-sloth.md`. Here's a summary of what it covers:

**4 steps, in order:**

1. **Unit tests for `hash-password`** (`src/utils/hash-password.test.ts`) — 7 tests covering hash generation, salting, and `verifyPassword` correctness vs wrong passwords vs malformed input.

2. **`hash-password` utility** (`src/utils/hash-password.ts`) — PBKDF2-SHA256 via Web Crypto API (310k iterations, 16-byte salt), exports `hashPassword` 
...(truncated)

### build (2026-04-18T10:16:41)
The plan is written to `/home/runner/.claude/plans/shimmering-splashing-puzzle.md` and ready for your review.

**Summary of the plan:**

The existing `src/collections/Users.ts` Payload collection already uses the slug `users` and has a `role` field aligned with `RbacRole`, but it's missing the `hash`/`salt` fields that `AuthService.login()` expects. Rather than creating a parallel collection, the plan extends the existing `Users` collection:

1. **`src/utils/hash-password.ts`** — PBKDF2-SHA256 u
...(truncated)
