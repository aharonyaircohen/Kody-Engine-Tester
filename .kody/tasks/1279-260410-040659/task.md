# [mem-20260410-0349] M08: Add session cleanup utility

Create `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` in `src/auth/session-cleanup.ts` that removes expired sessions and returns count removed. With tests

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1279-260410-040159` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24225693890))

To rerun: `@kody rerun 1279-260410-040159 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should the function use `createdAt + maxAgeMs` (session age from creation) or `expiresAt`/`refreshExpiresAt` (token expiry)? The task says `maxAgeMs` which implies creation-time-based age, but Session already has `expiresAt`/`refreshExpiresAt` fields.
2. Should `maxAgeMs` compare against `createdAt`, `expiresAt`, or both timestamps? The existing `cleanup()` checks both expiresAt and refreshExpiresAt.
3. Should this utility call `store.cleanup()` internally or implement its own filtering logic? The existing `cleanup()` takes no parameters while `maxAgeMs` suggests parameterized filtering.

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1279-260410-040659` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24225787982))

To rerun: `@kody rerun 1279-260410-040659 --from <stage>`

