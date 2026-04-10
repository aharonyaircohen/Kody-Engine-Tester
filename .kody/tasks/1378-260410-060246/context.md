
### taskify (2026-04-10T06:05:25)
{
  "task_type": "feature",
  "title": "Add deepMerge utility function",
  "description": "Create `deepMerge<T>(target: T, source: Partial<T>): T` in `src/utils/object-helpers.ts` — a recursive merge utility that combines source into target without mutating the original. Should handle nested objects recursively and return the merged result. Include comprehensive tests covering primitives, nested objects, arrays, and edge cases.",
  "scope": ["src/utils/object-helpers.ts", "src/utils/object-helpe
...(truncated)

### build (2026-04-10T06:07:46)
Done. The `deepMerge` utility has been implemented:

**`src/utils/object-helpers.ts`** - 19 lines
- `deepMerge<T>(target: T, source: Partial<T>): T` - recursively merges without mutation
- Uses `isPlainObject` helper pattern from `diff.ts`
- JSDoc comments following `deep-clone.ts` conventions

**`src/utils/object-helpers.test.ts`** - 18 tests covering:
- Primitives and edge cases (empty objects, null, undefined)
- Target immutability
- Primitive overwrites
- Deeply nested object merging
- Array
...(truncated)
