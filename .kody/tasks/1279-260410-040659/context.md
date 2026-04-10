
### taskify (2026-04-10T04:08:15)
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` in `src/auth/session-cleanup.ts` that removes sessions where `Date.now() - createdAt.getTime() > maxAgeMs` and returns the count of removed sessions. Include co-located tests.",
  "scope": ["src/auth/session-cleanup.ts", "src/auth/session-cleanup.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/session-store.t
...(truncated)

### build (2026-04-10T04:10:34)
Implementation complete. Created:

**`src/auth/session-cleanup.ts`**
- `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number`
- Removes sessions where `Date.now() - createdAt.getTime() > maxAgeMs`
- Returns count of removed sessions
- Handles invalid `createdAt` dates (treated as immediately expired)

**`src/auth/session-cleanup.test.ts`** - 6 tests:
- Returns 0 when no sessions exist
- Returns 0 when no sessions are expired  
- Removes sessions older than maxAgeMs
- Returns corre
...(truncated)
