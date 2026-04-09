
### taskify (2026-04-09T17:14:18)
```json
{
  "task_type": "feature",
  "title": "Add buildSearchFilter utility for Payload multi-field search",
  "description": "Create `buildSearchFilter(query: string, fields: string[]): object` in `src/services/search-filter.ts` that builds a Payload-compatible where clause for multi-field text search. When query is empty or fields is empty, return empty object. Each field gets a `like` condition combined with `or`. Includes tests in `src/services/search-filter.test.ts`.",
  "scope": [
    "s
...(truncated)

### plan (2026-04-09T17:14:33)
## Existing Patterns Found

- `src/services/course-search.ts:47-53`: Multi-field text search uses `or` + `like` conditions for `title` and `description` fields, returning `as Where`. This is the exact pattern to reuse.

## Plan

**Step 1: Write the test file**

**File:** `src/services/search-filter.test.ts`
**Change:** Create test suite for `buildSearchFilter` covering: empty query → empty object, empty fields → empty object, single field, multiple fields, query with whitespace.
**Why:** TDD — t
...(truncated)

### build (2026-04-09T17:15:35)
Implementation complete. Summary:

**Created files:**
- `src/services/search-filter.ts` - Implementation of `buildSearchFilter(query, fields)`
- `src/services/search-filter.test.ts` - 7 tests covering all cases

**Implementation:**
- Returns `{}` when `query` is empty OR `fields` is empty
- Builds `{ or: [{ field1: { like: query } }, { field2: { like: query } }, ...] }` for multi-field search
- Uses `Where` type from Payload (same pattern as `course-search.ts:47-53`)

**Verification:**
- All 7 t
...(truncated)

### review (2026-04-09T17:18:27)
## Verdict: PASS

## Summary

Created `src/services/search-filter.ts` implementing `buildSearchFilter(query, fields)` that builds Payload-compatible Where clauses for multi-field text search using the `or` + `like` pattern from `course-search.ts:47-53`. Added 7 tests in `src/services/search-filter.test.ts` covering empty inputs, single/multiple fields, and whitespace handling.

## Findings

### Critical

None.

### Major

None.

### Minor

None.

---

## Two-Pass Review

**Pass 1 — CRITICAL:**


...(truncated)
