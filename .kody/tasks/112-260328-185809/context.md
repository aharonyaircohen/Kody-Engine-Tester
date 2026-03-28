
### taskify (2026-03-28T18:58:43)
```json
{
  "task_type": "feature",
  "title": "Build instructor course analytics dashboard",
  "description": "Create an instructor analytics dashboard with course statistics, module completion tracking, at-risk student identification, and instructor overview. Implement analytics service with `getCourseAnalytics(courseId)` and `getInstructorOverview(instructorId)`, dashboard page at `src/app/(frontend)/instructor/analytics/page.tsx`, and three components: AnalyticsCard, CompletionChart, and AtR
...(truncated)

### plan (2026-03-28T19:01:13)
## Step 1: Define analytics types and service interface

**File:** `src/services/analytics.ts`
**Change:** Create the types and `AnalyticsService` class with dependency injection (matching the `GradingService` pattern). Define `CourseAnalytics`, `InstructorOverview`, `ModuleCompletion`, `AtRiskStudent` types and the `AnalyticsServiceDeps` interface. Implement `getCourseAnalytics` and `getInstructorOverview` as pure computation over injected data fetchers.
**Why:** Dependency injection makes the 
...(truncated)

### build (2026-03-28T19:06:20)
All 18 tests pass. Here's a summary of what was implemented:

**Files created:**

- `src/services/analytics.ts` — `AnalyticsService` class with DI pattern matching `GradingService`. Computes: enrollment counts, completion rate, weighted grade average (40% quiz / 60% assignment), module completion breakdown, most difficult quiz, at-risk students.
- `src/services/analytics.test.ts` — 13 tests covering all computation paths (edge cases, empty data, exclusions, aggregation).
- `src/components/analyt
...(truncated)

### review (2026-03-28T19:07:20)
## Verdict: FAIL

## Summary
Implements instructor analytics dashboard with service layer (DI pattern), three UI components, and thorough unit tests. The service logic and tests are solid, but the Payload integration layer in the page component has a significant N+1 query bug and a duplicate data-fetch issue.

## Findings

### Critical
None.

### Major

1. `src/app/(frontend)/instructor/analytics/page.tsx:39-43` — **N+1 query in `getModulesByCourse`**: The inner loop fetches lessons for every mo
...(truncated)
