
### taskify (2026-04-18T12:49:26)
Now I have a complete picture of the codebase. Let me compile the classification.

```json
{
  "task_type": "refactor",
  "title": "Migrate login to Payload auth and deprecate UserStore",
  "description": "Unify the dual auth system by routing all login through AuthService (Payload-based PBKDF2) instead of UserStore (in-memory SHA-256). Specifically: (1) add explicit `hash` and `salt` text fields to the Users collection with admin-only read access to expose Payload's built-in auth credentials fo
...(truncated)

### build (2026-04-18T12:52:32)
All changes have been implemented and verified. Here's a summary of what was done:

---

## Changes Made

### 1. `src/collections/Users.ts` — Added `hash` and `salt` fields
Two new fields added to the Users Payload collection (after the `permissions` field):

- **`salt`** (`text`, hidden, read-only): Populated by Payload's built-in auth. Admin-only read access via `({ req: { user } }) => user?.role === 'admin'`. Create/update blocked.
- **`hash`** (`text`, hidden, read-only): Same access pattern
...(truncated)
