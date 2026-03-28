
### build (2026-03-28T19:36:04)
All fixes are in place. Here's a summary of every change made:

**`src/app/(frontend)/instructor/analytics/page.tsx`**
- **N+1 query fix (Critical)**: `getModulesByCourse` now fetches all lessons in one query with `{ module: { in: moduleIds } }`, groups them by module ID with a `Map`, and maps each module to its correct lessons — eliminating both the wrong filter (`course` instead of `module`) and the per-module loop query.
- **Duplicate data fetch (Major)**: Replaced `svc.getInstructorOverview(
...(truncated)
