

The plan is complete. Here's what was produced:

---

## Plan Summary: P2T29 Compose Retry — Skip Already-Merged Branches

**Location:** `.kody/tasks/compose/plan.md`

### Pattern Discovery Report

Three existing patterns were identified and reused:

- **`src/validation/compose.ts`** — chains validators; short-circuits on first failure; no-op on empty. Reused as the base mechanism for skip/merge checking.
- **`src/utils/retry-queue.ts`** — exponential backoff queue with `enqueue → process()` loop, `_mergedBranches` Set for tracking, and `onRetry` callbacks. Extended with `skipMerged`/`unskipMerged`/`isMerged` methods.
- **Test colocation** — `describe/it` blocks with `vi.fn()` and `vi.useFakeTimers()` for async tests.

### 5 Steps (TDD order)

| # | File | What |
|---|------|-------|
| 1 | `src/utils/retry-queue.test.ts` | TDD: add tests for `skipMerged`, `isMerged`, idempotent unskip |
| 2 | `src/utils/retry-queue.ts` | Implement `_mergedBranches: Set<string>`, `skipMerged`/`unskipMerged`/`isMerged`, short-circuit in `_processEntry` |
| 3 | `src/validation/compose.test.ts` | TDD: compose retry-skip scenario tests for merged branch short-circuit |
| 4 | `src/validation/compose.ts` | Add `composeWithSkip(skippedBranches[], ...validators)` function |
| 5 | `.kody/tasks/compose/status.json` | Mark `plan` → completed, `build` → in_progress |

### Questions (3 max)

1. Should the implementation emit structured `merge.*skip` log entries so CI grep-based assertions pass, or is that handled by the dispatch layer?
2. Keep `_mergedBranches` check as `String(entry.item)` for generic safety, or narrow to `string` only?
3. Should `skipMerged`/`unskipMerged` be idempotent to handle duplicate compose retry dispatches cleanly?