
### taskify (2026-04-10T10:59:13)
{
  "task_type": "feature",
  "title": "Add debounce-advanced utility with tests",
  "description": "Create a new debounce utility function in src/utils/debounce-advanced.ts with tests in debounce-advanced.test.ts. This is a simple single-file task that should NOT be decomposable. It tests that simple tasks fall back to normal pipeline instead of attempting decompose when triggered by @kody decompose. Expected: complexity_score < 4, falls back to normal pipeline, PR created via runPipeline().",

...(truncated)

### build (2026-04-10T11:07:16)
The implementation is complete. Here's a summary of what was created:

**Files Created:**
1. `src/utils/debounce-advanced.ts` - Advanced debounce utility with:
   - `DebounceAdvancedOptions` interface (`leading`, `trailing`, `maxWait`)
   - `DebouncedFunction<T>` interface for the callable function with methods
   - `debounceAdvanced` function implementing debounce with `cancel()` and `flush()` methods

2. `src/utils/debounce-advanced.test.ts` - 16 tests covering:
   - Basic debounce behavior
  
...(truncated)
