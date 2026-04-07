Now I have a clear picture of the existing patterns. Let me create the implementation plan.

## Existing Patterns Found

- **Service pattern** (`CourseSearchService`): Constructor takes `Payload`, async methods, `Where[]` conditions array, typed return interfaces
- **Route handler pattern** (`/api/courses/search/route.ts`): `withAuth` HOC, `searchParams` parsing, `sanitizeHtml`, validation Sets, `getPayloadInstance()`, `NextResponse`
- **Cache class** (`Cache<K, V>`): Generic LRU with TTL, `set/get/has/delete`, `stats()`
- **Middleware pattern** (`rate-limiter.ts`): Factory function returning middleware with attached properties
- **Test pattern** (`course-search.test.ts`): `vi.fn()` mocks, `createMockPayload()` helper, `describe/it` blocks

---

## Implementation Plan

**Step 1: Create searchHelpers utility**
**File:** `src/utils/searchHelpers.ts`
**Change:** Create query building helper with `buildSearchWhere()` function that constructs Payload `Where` conditions from search query and filter options. Reuse the `SearchFilters` interface pattern from `course-search.ts`.
**Why:** Query building logic belongs in utils, not services or routes — follows single-responsibility principle.
**Verify:** `pnpm test:int src/utils/searchHelpers.test.ts`

---

**Step 2: Create searchService**
**File:** `src/services/searchService.ts`
**Change:** Create `SearchService` class with `search(query, filters, pagination)` method. Use `searchHelpers.buildSearchWhere()` for condition building. Search across courses, lessons, and notes collections. Return unified result format.
**Why:** Reuse `CourseSearchService` pattern but generalize to multi-collection search.
**Verify:** `pnpm test:int src/services/searchService.test.ts`

---

**Step 3: Create searchService test**
**File:** `src/services/searchService.test.ts`
**Change:** Write tests following `course-search.test.ts` pattern — mock Payload, test empty results, query matching, filter combinations, pagination.
**Why:** TDD: test before implementation.
**Verify:** Tests fail initially (expected), then pass after Step 2.

---

**Step 4: Create searchCache middleware**
**File:** `src/middleware/searchCache.ts`
**Change:** Create `createSearchCacheMiddleware()` factory using `Cache` class. Cache search results by query+filters hash, configurable TTL. Reuse `rate-limiter.ts` factory pattern.
**Why:** Reuse existing `Cache<K,V>` class and middleware factory pattern.
**Verify:** `pnpm test:int src/middleware/searchCache.test.ts`

---

**Step 5: Create searchCache test**
**File:** `src/middleware/searchCache.test.ts`
**Change:** Test cache hit/miss, TTL expiration, cache key uniqueness per query+filters.
**Why:** TDD: test before implementation.
**Verify:** Tests fail initially, then pass after Step 4.

---

**Step 6: Create search API route**
**File:** `src/routes/search.ts`
**Change:** Create `GET` handler using `withAuth`, parse `q`, `collections`, `page`, `limit` params, sanitize with `sanitizeHtml`, validate collections against whitelist, call `SearchService`, return JSON.
**Why:** Reuse route handler pattern from `course-search.ts` route.
**Verify:** `pnpm test:int src/routes/search.test.ts`

---

**Step 7: Create search route test**
**File:** `src/routes/search.test.ts`
**Change:** Test param parsing, validation errors, auth handling.
**Why:** TDD: test before implementation.
**Verify:** Tests fail initially, then pass after Step 6.

---

**Step 8: Run full test suite**
**Verify:** `pnpm test:int` passes with no regressions.
