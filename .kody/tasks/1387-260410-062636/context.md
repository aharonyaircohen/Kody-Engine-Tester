
### taskify (2026-04-10T06:29:15)
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` in `src/auth/session-cleanup.ts` that removes sessions where `createdAt + maxAgeMs < now` and returns the count of removed sessions. Include co-located tests.",
  "scope": ["src/auth/session-cleanup.ts", "src/auth/session-cleanup.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/session-store.ts:11-14 - Session
...(truncated)

### build (2026-04-10T06:40:18)
All 8 tests pass. Let me provide a summary of what was implemented:

## Summary

Created `src/auth/session-cleanup.ts` with the `cleanExpiredSessions` utility function:

```typescript
export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number
```

**Behavior**: Removes sessions where `createdAt + maxAgeMs < now` and returns the count of removed sessions.

**Created files**:
- `src/auth/session-cleanup.ts` - The utility function implementation
- `src/auth/session-cleanup.
...(truncated)
