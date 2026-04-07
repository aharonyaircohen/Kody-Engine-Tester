
### taskify (2026-04-07T20:46:12)
{"task_type":"feature","title":"Add pagination helper","description":"Create a generic `paginate<T>(items: T[], page: number, pageSize: number)` utility in `src/services/pagination.ts` that returns `{ data: T[]; total: number; pages: number; hasNext: boolean }` with co-located tests following the existing utility pattern (e.g., `chunk.ts`).","scope":["src/services/pagination.ts","src/services/pagination.test.ts"],"risk_level":"low","existing_patterns":["src/utils/chunk.ts — single-function utili
...(truncated)

### build (2026-04-07T20:48:13)
Done. Created the pagination helper following the existing `chunk.ts` pattern:

**`src/services/pagination.ts`** - Generic `paginate<T>` function that:
- Takes `items: T[]`, `page: number` (1-indexed), `pageSize: number`
- Returns `{ data: T[]; total: number; pages: number; hasNext: boolean }`
- Throws on invalid inputs (`page < 1` or `pageSize < 1`)

**`src/services/pagination.test.ts`** - 11 tests covering:
- First/second/last page scenarios
- Empty arrays
- Page beyond total pages
- Page size
...(truncated)
