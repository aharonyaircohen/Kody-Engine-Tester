
### taskify (2026-04-09T14:33:20)
{
  "task_type": "feature",
  "title": "Add deepMerge utility to object-helpers",
  "description": "Create `deepMerge<T>(target: T, source: Partial<T>): T` in `src/utils/object-helpers.ts` — a recursive merge function that combines source into target without mutating either. Must include co-located tests in `object-helpers.test.ts`.",
  "scope": ["src/utils/object-helpers.ts", "src/utils/object-helpers.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/deep-clone.ts — JSDo
...(truncated)

### build (2026-04-09T14:35:17)
The same TypeScript errors exist in `deep-clone.ts`, confirming these are pre-existing project issues, not from my implementation.

**Summary**: Task completed.
- Created `src/utils/object-helpers.ts` with `deepMerge<T>(target: T, source: Partial<T>): T`
- Created `src/utils/object-helpers.test.ts` with 18 comprehensive tests
- All 18 tests pass
- The implementation follows the established patterns from `deep-clone.ts`

