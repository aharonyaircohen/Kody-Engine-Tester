
### taskify (2026-04-09T16:15:03)
{
  "task_type": "feature",
  "title": "Add deepMerge utility to object-helpers.ts",
  "description": "Create `deepMerge<T>(target: T, source: Partial<T>): T` in `src/utils/object-helpers.ts` that recursively merges source into target without mutating either. Must include comprehensive tests covering primitives, nested objects, arrays, Date, RegExp, Map, Set, and edge cases.",
  "scope": [
    "src/utils/object-helpers.ts",
    "src/utils/object-helpers.test.ts"
  ],
  "risk_level": "low",
  "ex
...(truncated)

### build (2026-04-09T16:21:43)
Implementation complete. Created:

**`src/utils/object-helpers.ts`** - `deepMerge<T>(target: T, source: Partial<T>): T` function that:
- Recursively merges source into target without mutating either
- Handles Date, RegExp, Map, Set, arrays (replaced, not concatenated), and plain objects
- Source values override target values

**`src/utils/object-helpers.test.ts`** - 27 comprehensive tests covering:
- Primitives and null/undefined
- Non-mutation of both objects
- Deep nested object merging
- Arra
...(truncated)
