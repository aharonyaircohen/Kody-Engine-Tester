
### taskify (2026-04-10T07:11:37)
**Implementation complete.** I created:

1. **`src/services/search-filter.ts`** - The `buildSearchFilter(query, fields)` function that:
   - Returns empty object when query or fields are empty
   - Maps each field to a `{ field: { like: query } }` condition
   - Combines them with `or` for Payload-compatible where clause

2. **`src/services/search-filter.test.ts`** - 8 tests covering edge cases and multi-field scenarios

All 8 tests pass.


### build (2026-04-10T07:13:34)
## Verification Complete

**Implementation is confirmed working:**

| File | Status |
|------|--------|
| `src/services/search-filter.ts` | ✅ Exists with correct implementation |
| `src/services/search-filter.test.ts` | ✅ 8 tests passing |

**Implementation details:**
- Returns empty object `{}` when query or fields are empty
- Maps each field to `{ field: { like: query } }` condition
- Combines with `or` for Payload-compatible `Where` clause
- Type signature: `buildSearchFilter(query: string, f
...(truncated)
