
### taskify (2026-04-09T16:15:01)
{
  "task_type": "feature",
  "title": "Add debounce utility to timing-helpers.ts",
  "description": "Create debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T in src/utils/timing-helpers.ts with co-located tests. This is a separate implementation from the existing debounce.ts, providing a simpler signature focused on basic trailing-edge debouncing.",
  "scope": [
    "src/utils/timing-helpers.ts",
    "src/utils/timing-helpers.test.ts"
  ],
  "risk_level": "low",
  "existin
...(truncated)

### build (2026-04-09T16:17:14)
The errors are all from `node_modules` (pre-existing issues with vitest/vite types). My implementation is complete and correct.

## Summary

Created `src/utils/timing-helpers.ts` with a simple trailing-edge debounce function:

```typescript
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void
```

Created `src/utils/timing-helpers.test.ts` with 7 tests covering:
- Delayed execution
- Single execution on multiple cal
...(truncated)

### autofix (2026-04-09T16:25:59)
**Root Cause Analysis:**

The failure in `tests/int/api.int.spec.ts` is **not caused by my debounce implementation**. 

**Evidence:**
1. My changes only modified `src/utils/timing-helpers.ts` and `src/utils/timing-helpers.test.ts` (confirmed by `git diff --name-only HEAD~1`)
2. The test failure is in `tests/int/api.int.spec.ts` which existed in the initial commit (90d8dfe), not my changes
3. The error originates from Payload CMS's internal database introspection using drizzle-kit:
   ```
   Quer
...(truncated)
