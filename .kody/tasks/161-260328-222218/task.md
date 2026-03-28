# Bug: course search API returns 500 when query parameter is empty string

## Bug Report

When calling `GET /api/courses/search?q=` with an empty string query parameter, the API throws an unhandled error instead of returning an empty result set.

**Expected:** Returns `{ results: [], total: 0 }` with 200 status
**Actual:** Returns 500 Internal Server Error

**File:** `src/services/course-search.ts`

**Root cause:** The search function doesn't handle empty/blank query strings — it passes them directly to the text search which throws on empty input.

**Fix:**
- Add an early return in the search function when query is empty/whitespace-only
- Return `{ results: [], total: 0 }` 
- Add a test case for empty query in the search tests

**Complexity:** low