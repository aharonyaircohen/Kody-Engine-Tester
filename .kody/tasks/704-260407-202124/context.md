
### taskify (2026-04-07T20:24:56)
All 5 tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` in `src/auth/session-cleanup.ts` that removes sessions where `createdAt` is older than `maxAgeMs` and returns the count of removed sessions. Includes 5 test cases covering empty store, no expirations, boundary conditions, multi-session removal, and preservation of valid sessions."
...(truncated)

### build (2026-04-07T20:26:22)
All 5 tests pass. The `cleanExpiredSessions` utility is implemented and working correctly in `src/auth/session-cleanup.ts`.

