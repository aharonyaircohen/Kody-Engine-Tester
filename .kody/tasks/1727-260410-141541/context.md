
### taskify (2026-04-10T14:20:13)
Based on my exploration, I can see that `src/middleware/auth-middleware.ts` already exists with most of the functionality, but there are gaps between the current implementation and the acceptance criteria.

```json
{
  "task_type": "bugfix",
  "title": "Fix auth middleware to match acceptance criteria",
  "description": "The existing auth middleware in src/middleware/auth-middleware.ts needs corrections: (1) currently returns 401 for expired tokens but acceptance criteria requires 403, (2) lacks
...(truncated)

### build (2026-04-10T14:22:30)
The TypeScript errors shown are pre-existing issues in the codebase unrelated to my changes. My fix to `auth-middleware.ts` and `auth-middleware.test.ts` doesn't introduce any new type errors.

## Summary

**Fixed the auth middleware to match acceptance criteria:**

| Scenario | Before | After |
|----------|--------|-------|
| Missing/malformed token | 401 | 401 (unchanged) |
| Expired token | 401 | **403** |
| Invalid signature | 401 | 401 (unchanged) |

**Changes made:**
1. `src/middleware/aut
...(truncated)
