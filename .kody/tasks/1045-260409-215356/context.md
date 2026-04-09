
### taskify (2026-04-09T21:56:44)
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` in `src/auth/session-cleanup.ts` that removes sessions where `createdAt` is older than `maxAgeMs` and returns the count of removed sessions. Include co-located tests in `session-cleanup.test.ts`.",
  "scope": ["src/auth/session-cleanup.ts", "src/auth/session-cleanup.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/
...(truncated)

### build (2026-04-09T22:03:14)
Implementation complete. Here's a summary:

**Created files:**
- `src/auth/session-cleanup.ts` - The `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` function
- `src/auth/session-cleanup.test.ts` - Co-located tests using vitest fake timers

**Modified files:**
- `src/auth/session-store.ts` - Added `getAllSessions(): Session[]` method to support session enumeration

**Implementation details:**
- Removes sessions where `Date.now() - session.createdAt.getTime() > maxAgeMs`
- Re
...(truncated)
