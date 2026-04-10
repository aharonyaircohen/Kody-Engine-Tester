
### taskify (2026-04-10T00:47:24)
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` in `src/auth/session-cleanup.ts` that removes sessions older than maxAgeMs (based on createdAt) and returns the count of removed sessions. Include co-located tests in `session-cleanup.test.ts`.",
  "scope": [
    "src/auth/session-cleanup.ts",
    "src/auth/session-cleanup.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
...(truncated)

### build (2026-04-10T00:49:11)
All 66 auth tests pass (including my 7 new ones). Implementation complete:

**Created files:**
- `src/auth/session-cleanup.ts` - `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number`
- `src/auth/session-cleanup.test.ts` - 7 tests covering edge cases

**Modified:**
- `src/auth/session-store.ts` - added `getAll()` method to expose sessions for iteration

The function removes sessions where `Date.now() - session.createdAt.getTime() > maxAgeMs` and returns the count of removed sessio
...(truncated)
