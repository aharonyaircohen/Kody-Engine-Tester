
### taskify (2026-04-18T00:06:29)
The plan is ready for your review. The plan file is at `/home/runner/.claude/plans/shimmering-skipping-mochi.md`. 

It covers 4 implementation steps:
1. **`src/utils/password.ts`** — export `hashPassword` (and `verifyPassword`) using PBKDF2 matching the existing AuthService algorithm
2. **`src/collections/Users.ts`** — add `passwordHash` text field with `beforeChange` hook that hashes incoming passwords; additive only
3. **Migration `src/migrations/20260418_000000_add_password_hash.ts`** — purel
...(truncated)

### build (2026-04-18T00:08:38)
The plan is ready for your review. It covers:

- **Step 1** — `src/utils/password.ts`: New utility file with `hashPassword` and `verifyPassword` using PBKDF2 (25000 iterations, sha256, 512-bit key) — matching the existing `auth-service.ts` algorithm
- **Step 2** — `src/utils/password.test.ts`: Unit tests covering random-salt uniqueness and deterministic verification
- **Step 3** — `src/collections/Users.ts`: Add `passwordHash` field with a `beforeChange` hook that reads Payload's built-in `data.
...(truncated)
