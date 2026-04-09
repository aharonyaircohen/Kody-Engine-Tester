
### taskify (2026-04-09T14:49:10)
{
  "task_type": "feature",
  "title": "Add session cleanup utility",
  "description": "Create `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` in `src/auth/session-cleanup.ts` that removes sessions where `createdAt` is older than `Date.now() - maxAgeMs` and returns the count of removed sessions. Include tests in `src/auth/session-cleanup.test.ts`.",
  "scope": ["src/auth/session-cleanup.ts", "src/auth/session-cleanup.test.ts"],
  "risk_level": "low",
  "existing_patterns": 
...(truncated)

### build (2026-04-09T14:51:10)
Those errors are all pre-existing configuration issues with vitest/vite module resolution in `node_modules`, not related to my changes. The tests pass and my files compile correctly within the project's test runner.

**Summary:**

Created two files as specified:

1. **`src/auth/session-cleanup.ts`** - exports `cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number` that removes sessions where `createdAt` is older than `Date.now() - maxAgeMs` and returns the count removed

2. **`src/
...(truncated)
