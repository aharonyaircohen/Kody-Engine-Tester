
### taskify (2026-04-09T23:40:26)
All 5 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number in src/auth/session-cleanup.ts that removes sessions older than maxAgeMs and returns count removed. Includes 5 co-located tests covering: empty store, young sessions preserved, old sessions removed, count accuracy, and mixed age scenarios.",
  "scope": ["src/auth/session-cleanu
...(truncated)

### build (2026-04-09T23:47:04)
All TypeScript checks pass for the auth files. Here's a summary of the changes I made:

**Files modified:**

1. **`src/auth/session-store.ts`** - Added `getAllSessions()` method to expose sessions for iteration:
   ```typescript
   getAllSessions(): Session[] {
     return Array.from(this.sessions.values())
   }
   ```

2. **`src/auth/session-cleanup.ts`** - Updated to use proper `SessionStore` type and `getAllSessions()`:
   ```typescript
   import type { SessionStore } from './session-store'
 
...(truncated)
