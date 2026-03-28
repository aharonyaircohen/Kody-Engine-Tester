# Build instructor course analytics dashboard

Create an instructor dashboard showing analytics for their courses.

**Page:** `src/app/(frontend)/instructor/analytics/page.tsx`

**Service** (`src/services/analytics.ts`):
- `getCourseAnalytics(courseId)`:
  - Total enrollments, active students, completion rate
  - Average grade (quiz + assignment weighted)
  - Module-by-module completion breakdown
  - Most difficult quiz (lowest average score)
  - Students at risk (below 50% progress or below passing grade)
- `getInstructorOverview(instructorId)`:
  - Total courses, total students, average completion rate

**Components:**
- `AnalyticsCard` — stat with label, value, and trend indicator
- `CompletionChart` — bar chart showing module completion rates
- `AtRiskStudentsList` — table of students needing attention

**Include tests** for analytics calculations: completion rate with various enrollment states, grade averaging, at-risk student identification.