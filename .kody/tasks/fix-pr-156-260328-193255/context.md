
### build (2026-03-28T19:36:04)
All fixes are in place. Here's a summary of every change made:

**`src/app/(frontend)/instructor/analytics/page.tsx`**
- **N+1 query fix (Critical)**: `getModulesByCourse` now fetches all lessons in one query with `{ module: { in: moduleIds } }`, groups them by module ID with a `Map`, and maps each module to its correct lessons — eliminating both the wrong filter (`course` instead of `module`) and the per-module loop query.
- **Duplicate data fetch (Major)**: Replaced `svc.getInstructorOverview(
...(truncated)

### autofix (2026-03-28T19:40:31)
No type errors in any of the modified files. All fixes applied:

| File | Change |
|---|---|
| `src/utils/logger/index.ts:80` | `let context` → `const context` |
| `src/utils/logger/logger.test.ts:22,25` | `transport` → `_transport`, `entries` → `_entries` |
| `src/utils/omit.test.ts:57` | Removed unused `eslint-disable` directive |
| `src/utils/result.test.ts:2` | `Ok` → `Ok as _Ok` in import |
| `src/utils/retry-queue.test.ts:211,218` | `statsWhileRetrying` → `_statsWhileRetrying` |
| `src/uti
...(truncated)

### review (2026-03-28T19:42:15)
Now all three reasons are visually distinct:
- `'both'`: red (`#fef2f2` / `#dc2626`)
- `'low-grade'`: amber (`#fffbeb` / `#d97706`)
- `'low-progress'`: blue (`#eff6ff` / `#2563eb`)

All review findings are now addressed:
- **Critical** (N+1 query + wrong filter): already fixed in build stage
- **Major** (duplicate fetch, hardcoded instructorId): already fixed in build stage
- **Minor** (`'use client'` directives): already removed (components have no client directive)
- **Minor** (indistinguishab
...(truncated)

### review-fix (2026-03-28T19:42:33)
All review findings are confirmed fixed. No further changes needed:

**Critical — N+1 query + wrong filter** (`page.tsx:33-59`): Fixed. `getModulesByCourse` now issues one bulk query filtered by `{ module: { in: moduleIds } }`, groups results into a `Map`, and maps each module to its correct lesson IDs.

**Major — Duplicate data fetch** (`page.tsx:161-172`): Fixed. `getCoursesByInstructor` is called once, `getCourseAnalytics` is called once per course, and the overview is computed directly from 
...(truncated)
