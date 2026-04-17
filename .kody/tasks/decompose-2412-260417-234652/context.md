
### taskify (2026-04-17T23:50:07)
The plan has been written to `/home/runner/.claude/plans/lucky-stirring-teapot.md`. 

**Classification summary:**
- **Type:** `feature`
- **Title:** Add capitalize string utility with tests
- **Scope:** 2 new files — `src/utils/strings.ts` and `src/utils/strings.test.ts`
- **Risk:** `low` — purely additive, no existing files modified
- **Patterns to reuse:** Single-function-per-file utilities in `src/utils/` (e.g., `debounce.ts`, `retry.ts`, `flatten.ts`) with co-located vitest tests
- **Questio
...(truncated)

### build (2026-04-17T23:50:54)
The plan is written to `/home/runner/.claude/plans/quiet-gliding-crown.md`. Here's a summary:

**What:** Create `src/utils/strings.ts` with a `capitalize` function (capitalizes only the first letter, leaves rest unchanged) and `src/utils/strings.test.ts` with 5 vitest test cases covering basic capitalize, already capitalized, empty string, multi-word strings, and single character.

**Pattern reused:** Follows the exact same pattern as `src/utils/cap.ts` / `src/utils/cap.test.ts` and `src/utils/r
...(truncated)
