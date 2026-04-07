
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

### review (2026-04-07T21:29:21)
## Verdict: FAIL

## Summary

Added a complete search system with `SearchService`, `searchHelpers`, `searchCache` middleware, and `search.ts` route following existing patterns. However, there are critical logic errors in pagination and result merging, plus the cache middleware is non-functional.

## Findings

### Critical

**searchService.ts:78-79** — `totalPages` calculation is incorrect for multi-collection search. Summing `totalDocs` across collections and dividing by `limit` produces wrong p
...(truncated)

### review-fix (2026-04-07T21:37:16)
All 1786 tests pass. The only failure is the pre-existing `tests/int/api.int.spec.ts` database integration test.

## Summary of Fixes

### Critical Issues Fixed:

1. **`searchService.ts:totalPages`** - Fixed calculation to properly return 0 when no results, use `page + 1` when full page (might be more), and `page` otherwise.

2. **`searchCache.ts`** - Fixed non-functional cache by:
   - Adding `sharedCache` module-level instance
   - Exporting `cacheSearchResult()` and `getCachedSearchResult()` 
...(truncated)

### review (2026-04-07T21:37:33)

## Verdict: FAIL

## Summary

Added a complete search system with `SearchService`, `searchHelpers`, `searchCache` middleware, and `search.ts` route following existing patterns. However, there are critical logic errors in pagination and result merging, plus the cache middleware is non-functional.

## Findings

### Critical

**searchService.ts:78-79** — `totalPages` calculation is incorrect for multi-collection search. Summing `totalDocs` across collections and dividing by `limit` produces wrong 
...(truncated)

### review-fix (2026-04-07T21:41:08)
All 1786 tests pass. The only failure is the pre-existing `tests/int/api.int.spec.ts` database integration test.

## Fix Applied

The critical issue was that `sharedCache` was never initialized because `createSearchCacheMiddleware()` was never called.

**Fix**: Added module-level initialization at the bottom of `searchCache.ts`:
```typescript
// Initialize shared cache at module load
const DEFAULT_TTL = 60_000
const DEFAULT_MAX_SIZE = 1000
initSharedCache(DEFAULT_TTL, DEFAULT_MAX_SIZE)
```

Now 
...(truncated)

### review (2026-04-07T21:41:46)
## Verdict: FAIL

## Summary

Added a complete search system with `SearchService`, `searchHelpers`, `searchCache` middleware, and `search.ts` route following existing patterns. The cache write path was fixed but critical logic errors in pagination and result merging remain.

## Findings

### Critical

**searchService.ts:82-89** — `totalPages` calculation is still fundamentally flawed for multi-collection search. The logic `allDocs.length === limit → totalPages = page + 1` assumes the `limit` app
...(truncated)
