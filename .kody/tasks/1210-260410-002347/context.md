
### taskify (2026-04-10T00:26:26)
{
  "task_type": "feature",
  "title": "Add deepMerge utility function",
  "description": "Create `deepMerge<T>(target: T, source: Partial<T>): T` in `src/utils/object-helpers.ts` — a recursive merge utility that combines source into target without mutating the original. Must include comprehensive tests covering primitives, nested objects, arrays, and edge cases.",
  "scope": [
    "src/utils/object-helpers.ts",
    "src/utils/object-helpers.test.ts"
  ],
  "risk_level": "low",
  "existing_patte
...(truncated)

### build (2026-04-10T00:30:12)
Done. Created the `deepMerge` utility with 26 comprehensive tests covering:

**`src/utils/object-helpers.ts`** - Implementation:
- `deepMerge<T>(target: T, source: Partial<Record<string, unknown>>): T`
- Recursive merge without mutation
- Arrays replaced (not concatenated)
- Handles `null`/`undefined` in source

**`src/utils/object-helpers.test.ts`** - 26 tests covering:
- Primitives (null, undefined, booleans, zero, empty strings)
- Nested objects (shallow and deeply nested)
- Arrays (including
...(truncated)
