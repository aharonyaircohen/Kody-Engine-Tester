## Existing Patterns Found

- `src/services/course-search.ts:47-53`: Multi-field text search uses `or` + `like` conditions for `title` and `description` fields, returning `as Where`. This is the exact pattern to reuse.

## Plan

**Step 1: Write the test file**

**File:** `src/services/search-filter.test.ts`
**Change:** Create test suite for `buildSearchFilter` covering: empty query → empty object, empty fields → empty object, single field, multiple fields, query with whitespace.
**Why:** TDD — tests drive the implementation.
**Verify:** `pnpm test:int src/services/search-filter.test.ts`

---

**Step 2: Implement the function**

**File:** `src/services/search-filter.ts`
**Change:** Create `buildSearchFilter(query: string, fields: string[]): object`:
- Return `{}` when `query` is empty OR `fields` is empty
- Build `{ or: fields.map(field => ({ [field]: { like: query } })) }` for multi-field search
- Import type `Where` from `payload` per existing pattern
**Why:** Mirrors the `or`/`like` pattern already used in `course-search.ts:47-53`.
**Verify:** `pnpm test:int src/services/search-filter.test.ts`

---

**Step 3: Verify all tests pass**

**File:** `src/services/search-filter.test.ts`, `src/services/search-filter.ts`
**Verify:** `pnpm test:int src/services/search-filter`

---

## Questions

None — the task is clear and the Payload `Where` clause pattern is established in `course-search.ts`.
