
### build (2026-04-07T13:00:32)
The TypeScript errors are pre-existing in other files and not related to the new `capitalize.ts` I created. The new files have no type errors.

**Summary of implementation:**

Created `src/utils/capitalize.ts`:
```typescript
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
```

Created `src/utils/capitalize.test.ts` with 6 tests covering:
- Capitalizes first letter and lowercases the rest
- Lowercases rest
...(truncated)

### review (2026-04-07T13:04:37)
## Verdict: PASS

## Summary

Added a `capitalize` utility function in `src/utils/capitalize.ts` that capitalizes the first letter and lowercases the rest of a string, with comprehensive tests in `src/utils/capitalize.test.ts`. All 6 tests pass.

## Findings

### Critical

None.

### Major

None.

### Minor

None.

---

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety
None — no SQL operations.

### Race Conditions & Concurrency
None — pure string utility with no side effects.

#
...(truncated)

### review-fix (2026-04-07T13:05:02)
The review passed with no critical or major findings. The `capitalize` utility function implementation is complete and verified.

**Final Status:**
- `src/utils/capitalize.ts` — implementation with `export function capitalize(str: string): string`
- `src/utils/capitalize.test.ts` — 6 tests, all passing
- Review verdict: **PASS** (no Critical/Major issues)

The task is complete.

