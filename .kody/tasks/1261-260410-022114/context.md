
### taskify (2026-04-10T02:24:09)
Done. Updated `src/utils/group-by.ts` to support both property keys (`keyof T`) and callback functions as required. Added 2 new tests for the property key functionality. All 10 tests pass.


### build (2026-04-10T02:26:11)
The `group-by` utility is already implemented and verified:

**Implementation** (`src/utils/group-by.ts`):
- Type signature: `groupBy<T>(array: T[], key: keyof T | ((item: T) => string | number)): Record<string, T[]>`
- Supports both property keys (`groupBy(items, 'dept')`) and callback functions (`groupBy(items, (item) => item.dept)`)
- Returns `Record<string, T[]>` with grouped elements

**Tests** (`src/utils/group-by.test.ts`):
- 10 tests covering: string grouping by length, object grouping b
...(truncated)
