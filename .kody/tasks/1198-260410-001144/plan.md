## Existing Patterns Found

- `src/app/(frontend)/dashboard/page.tsx` — existing dashboard page pattern with server components, Payload auth, data fetching, and composition of dashboard components
- `src/components/dashboard/ProgressRing.tsx` — existing SVG-based circular chart component (no external chart library)
- `src/components/dashboard/RecentActivity.tsx` — existing data table-like list component
- `src/components/dashboard/CourseProgressCard.tsx` — existing dashboard card using ProgressRing
- No chart library is installed (recharts/chart.js/visx not found), so SVG-based charts following the ProgressRing pattern are appropriate

## Plan

**Step 1: Create simple SVG bar chart component for analytics**
**File:** `src/components/dashboard/BarChart.tsx`
**Change:** Create new component with simple SVG bar chart (no external library)
**Why:** Provides chart visualization for dashboard without adding dependencies
**Verify:** `pnpm lint`

**Step 2: Create simple data table component**
**File:** `src/components/dashboard/DataTable.tsx`
**Change:** Create new reusable data table component with columns and rows
**Why:** Reusable table pattern for displaying data in the dashboard
**Verify:** `pnpm lint`

**Step 3: Create dashboard page at new path**
**File:** `src/app/dashboard/page.tsx`
**Change:** Create new dashboard page with server-side data fetching, charts, and data tables. Follow existing pattern from `src/app/(frontend)/dashboard/page.tsx` — use Payload auth, fetch analytics data, compose BarChart and DataTable components
**Why:** Task requires dashboard page at exact path `src/app/dashboard/page.tsx`
**Verify:** `pnpm build`

**Step 4: Create E2E test for dashboard page**
**File:** `tests/e2e/dashboard.spec.ts`
**Change:** Create Playwright test that navigates to `/dashboard` and verifies page loads with charts and data
**Why:** UI task should have Playwright test coverage
**Verify:** `pnpm test:e2e`

---

## Questions

- No architecture questions — task is clear with straightforward requirements
