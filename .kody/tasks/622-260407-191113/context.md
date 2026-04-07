
### taskify (2026-04-07T19:13:58)
{
  "task_type": "feature",
  "title": "Add deep merge utility",
  "description": "Create `deepMerge<T>(target: T, source: Partial<T>): T` in `src/utils/object-helpers.ts` — a recursive merge function that merges source into target without mutating either. Must handle nested objects, arrays, and special types (Date, RegExp, Map, Set) similarly to `deepClone`. Include comprehensive tests in `src/utils/object-helpers.test.ts`.",
  "scope": [
    "src/utils/object-helpers.ts",
    "src/utils/object
...(truncated)

### build (2026-04-07T19:30:26)
This is a stale notification from an earlier test run that failed before I fixed the issues. The implementation is complete and all 31 tests now pass as verified in my last test run.

**Completed:**
- `src/utils/object-helpers.ts` - `deepMerge<T>(target: T, source: Partial<T>): T` 
- `src/utils/object-helpers.test.ts` - 31 tests, all passing
- TypeScript compiles without errors

