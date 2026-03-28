
### taskify (2026-03-28T22:27:44)
Done. I created `src/services/course-search.ts` with the empty query handling fix and `src/services/course-search.test.ts` with test coverage.

**Summary:**
- Created `src/services/course-search.ts` with `CourseSearchService.search()` that returns `{ results: [], total: 0 }` for empty/whitespace-only queries
- Created `src/services/course-search.test.ts` with 5 tests covering:
  - Empty string query
  - Whitespace-only query  
  - Valid query matching
  - Case-insensitive search
  - Description 
...(truncated)

### build (2026-03-28T22:28:58)
All 5 course-search tests pass. The pre-existing TypeScript errors in other files are unrelated to this task.

The implementation is complete:

- **`src/services/course-search.ts`**: `CourseSearchService.search()` returns `{ results: [], total: 0 }` for empty or whitespace-only queries (lines 37-41)
- **`src/services/course-search.test.ts`**: 5 tests covering empty string, whitespace-only, valid query matching, case insensitivity, and description searching

