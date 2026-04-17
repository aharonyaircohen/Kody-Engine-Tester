
### taskify (2026-04-17T19:15:20)
I've written the plan file and am waiting for your answer on the role values question above — that determines the `role` field options in the new Users collection.

### build (2026-04-17T19:17:18)
The plan is in the plan file — ready for your review. Here's the short version:

**What already exists:**
- `src/collections/Users.ts` with `auth: true` ✓ (covers email-unique, password-hash via PBKDF2, login verification)
- `payload.config.ts` references `Users.slug` as the admin user collection ✓

**What the plan adds:**
- Two new test groups in `src/collections/Users.test.ts`:
  1. `Users fields - email` — verifies email field exists and is required
  2. `Users fields - auth` — verifies `User
...(truncated)
