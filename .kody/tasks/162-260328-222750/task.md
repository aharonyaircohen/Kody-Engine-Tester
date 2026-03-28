# Add pagination support to course search API

## Feature Request

Add pagination parameters to the course search endpoint.

**File:** `src/services/course-search.ts`

**Requirements:**
- Add `page` (default: 1) and `limit` (default: 20, max: 100) parameters to the search function
- Return pagination metadata: `{ results, total, page, limit, totalPages }`
- Add input validation (page >= 1, 1 <= limit <= 100)
- Update existing tests and add new ones for pagination edge cases (page beyond results, limit=1, etc.)

**Complexity:** medium