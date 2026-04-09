
### taskify (2026-04-09T21:23:02)
All 16 tests pass.

```json
{
  "task_type": "feature",
  "title": "Add deepMerge utility",
  "description": "Created deepMerge<T>(target: T, source: Partial<T>): T in src/utils/object-helpers.ts with recursive merge for nested objects, skipping null/undefined source values, and replacing arrays. Date objects are treated as primitives (replaced, not merged). Includes 16 tests covering flat merge, nested objects, null/undefined handling, arrays, and Date objects.",
  "scope": ["src/utils/object-h
...(truncated)

### build (2026-04-09T21:27:45)
**Implementation complete.** 

**Summary:**
- `src/utils/object-helpers.ts` - `deepMerge<T, S>(target: T, source: S): T` function
- `src/utils/object-helpers.test.ts` - 16 tests covering:
  - Basic merge, no mutation, new object returned
  - Nested object recursion
  - Null/undefined handling
  - Array replacement
  - Date object support
  - Mixed types

**Verification:**
- All 16 tests pass
- No TypeScript errors in these files
- The integration test failure in `tests/int/api.int.spec.ts` is a 
...(truncated)
