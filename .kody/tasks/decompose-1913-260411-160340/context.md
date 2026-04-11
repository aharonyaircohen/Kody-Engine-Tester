
### taskify (2026-04-11T16:06:54)
Based on my analysis, this is a simple task classification for the decompose pipeline. The task is to add a string capitalize utility function, which is a single-file, low-complexity feature that should NOT be decomposed (complexity_score < 4).

```json
{
  "task_type": "feature",
  "title": "Add capitalize-simple utility function",
  "description": "Add a string capitalize utility function in src/utils/capitalize-simple.ts. This simple task should fall back to normal pipeline since complexity_s
...(truncated)

### build (2026-04-11T16:07:51)
The TypeScript errors shown are pre-existing issues in other files, not in my new implementation. The new files are type-safe.

**Summary:**
- Created `src/utils/capitalize-simple.ts` with a minimal first-letter capitalize function
- Created `src/utils/capitalize-simple.test.ts` with 4 tests following existing patterns
- All tests pass (4/4)

