
### taskify (2026-04-09T22:44:48)
{
  "task_type": "feature",
  "title": "Add deep-freeze utility function",
  "description": "Create a `deep-freeze.ts` utility in `src/utils/` that recursively freezes an object and all nested objects and arrays, making them immutable. Must handle plain objects, arrays, Maps, and Sets. Returns the same object (frozen in place). Must be tree-shakeable via named ESM export.",
  "scope": ["src/utils/deep-freeze.ts", "src/utils/deep-freeze.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
 
...(truncated)

### build (2026-04-09T22:46:29)
All tests pass and no TypeScript errors in the new files. The pre-existing errors in the codebase (in `src/pages/`, `tests/helpers/`) are unrelated to this change.

**Summary:**
- Created `src/utils/deep-freeze.ts` — recursively freezes objects, arrays, Maps, and Sets; uses `WeakSet` for cycle detection; returns the frozen object in place; tree-shakeable named ESM export
- Created `src/utils/deep-freeze.test.ts` — 17 tests covering primitives, plain objects, arrays, Maps, Sets, nested structures
...(truncated)
