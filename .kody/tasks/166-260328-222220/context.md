
### taskify (2026-03-28T22:27:26)
Done. I created `src/services/gradebook.ts` with the fix for the weighted average calculation bug.

**Summary:**
- Created `src/services/gradebook.ts` with `computeWeightedGrade()` function
- Created comprehensive test suite with 9 tests in `src/services/gradebook.test.ts`

**Key fixes:**
1. **Filters out zero-weight categories** - prevents them from diluting the average
2. **Handles empty score arrays** - categories with no scores contribute 0 but still count toward total weight denominator
3. 
...(truncated)

### build (2026-03-28T22:28:51)
No type errors in the gradebook files. The pre-existing TypeScript errors are unrelated to this implementation.

**Summary**: The fix is complete. `src/services/gradebook.ts` correctly:
- Filters out `weight=0` categories before calculation (avoids division-by-zero)
- Returns `null` grade when no valid categories remain
- Handles empty score arrays gracefully (contributes 0 to weighted sum but still includes weight in denominator)
- All 9 tests pass

