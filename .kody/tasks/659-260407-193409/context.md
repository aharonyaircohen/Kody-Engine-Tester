
### taskify (2026-04-07T19:37:34)
Based on my exploration, I can classify this task:

```json
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number in src/auth/session-cleanup.ts that removes sessions older than maxAgeMs and returns count of removed sessions. Should have comprehensive tests in session-cleanup.test.ts.",
  "scope": [
    "src/auth/session-cleanup.ts",
    "src/auth/session-cleanup.test.ts"
  ],
  "risk_lev
...(truncated)

### build (2026-04-07T19:42:20)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/auth/session-cleanup.ts`** - The session cleanup utility that:
   - Takes a `SessionStore` and `maxAgeMs` parameter
   - Removes sessions where `createdAt` is older than `maxAgeMs`
   - Returns the count of removed sessions

2. **`src/auth/session-cleanup.test.ts`** - 9 comprehensive tests covering:
   - Empty store (returns 0)
   - Remove sessions older than maxAgeMs
   - Keep sessions newer than maxAgeMs
   - Multiple ex
...(truncated)
