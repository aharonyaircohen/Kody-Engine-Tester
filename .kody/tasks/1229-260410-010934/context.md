
### taskify (2026-04-10T01:12:03)
{
  "task_type": "feature",
  "title": "Add pagination helper utility",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts` with co-located tests. The function should slice the array based on page/pageSize and return pagination metadata.",
  "scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src
...(truncated)

### build (2026-04-10T01:14:03)
The TypeScript errors are pre-existing and unrelated to the pagination files I created. All 12 pagination tests pass.

**Summary:**
- Created `src/services/pagination.ts` with the `paginate<T>` function (JSDoc, generic type, error handling for invalid input)
- Created `src/services/pagination.test.ts` with 12 tests covering: first/middle/last pages, edge cases (empty array, single item, page beyond total), type handling (strings, objects), and error cases (page < 1, pageSize < 1)
- All tests pas
...(truncated)

### autofix (2026-04-10T01:17:13)
The `pg_constraint` drizzle query error is **not in any source file** - it originates from `node_modules/drizzle-kit/api.js:44742` during Payload's database introspection. The `tests/int/api.int.spec.ts` file contains only 20 lines of simple Payload code with no explicit drizzle queries:

```typescript
// tests/int/api.int.spec.ts (full file)
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: 
...(truncated)
