
### taskify (2026-04-07T21:10:00)
{
  "task_type": "feature",
  "title": "Add search system with service, API route, helpers, and caching",
  "description": "Create a complete search system with four new components: (1) searchService.ts in src/services/ for full-text search using Payload, (2) search.ts API route in src/routes/ with query parameter handling, (3) searchHelpers.ts utility in src/utils/ for query building, and (4) searchCache.ts middleware in src/middleware/ for caching layer. Reuse existing patterns from course-sea
...(truncated)

### plan (2026-04-07T21:10:38)
Now I have a clear picture of the existing patterns. Let me create the implementation plan.

## Existing Patterns Found

- **Service pattern** (`CourseSearchService`): Constructor takes `Payload`, async methods, `Where[]` conditions array, typed return interfaces
- **Route handler pattern** (`/api/courses/search/route.ts`): `withAuth` HOC, `searchParams` parsing, `sanitizeHtml`, validation Sets, `getPayloadInstance()`, `NextResponse`
- **Cache class** (`Cache<K, V>`): Generic LRU with TTL, `set/
...(truncated)

### build (2026-04-07T21:26:23)
## Implementation Complete

I've implemented the complete search system following the existing patterns in the codebase. Here's a summary:

### Files Created:

1. **`src/utils/searchHelpers.ts`** - Query building helper with:
   - `buildSearchWhere()` - Constructs Payload `Where` conditions
   - `buildSearchCacheKey()` - Generates unique cache keys
   - `validateCollections()` - Validates collection names against whitelist
   - `DEFAULT_SEARCHABLE_FIELDS` - Maps collections to searchable text fi
...(truncated)
