# Plan: Admin Dashboard with Charts and Data Tables

## Context

The task is to add a new admin/analytics dashboard page (`/admin-dashboard`) with charts showing enrollment trends and grade distributions, plus data tables for courses, users, and recent enrollments. This serves as an analytics overview for instructors and admins to monitor platform activity.

## Implementation Steps

### Step 1: Create the admin dashboard page component
**File:** `src/app/(frontend)/admin-dashboard/page.tsx`
**Change:** Create a new server component page that fetches data from Payload collections (courses, users, enrollments) and renders a dashboard with summary stats, charts, and data tables.
**Why:** New analytics page using existing Payload collections as data source.
**Verify:** `pnpm tsc --noEmit` passes.

### Step 2: Create the stats card component
**File:** `src/components/dashboard/StatsCard.tsx`
**Change:** Create a reusable `StatsCard` component for displaying KPI numbers (total courses, total enrollments, total users, completion rate).
**Why:** Reusable component following existing dashboard component patterns.
**Verify:** `pnpm tsc --noEmit` passes.

### Step 3: Create the enrollment chart component
**File:** `src/components/dashboard/EnrollmentChart.tsx`
**Change:** Create a client component chart showing enrollments over time using recharts (already in project dependencies or to be installed).
**Why:** Visualizes enrollment trends data from Payload.
**Verify:** `pnpm tsc --noEmit` passes.

### Step 4: Create the grades distribution chart component
**File:** `src/components/dashboard/GradesChart.tsx`
**Change:** Create a client component chart showing grade distribution (pass/fail, score ranges).
**Why:** Visualizes grade data from submissions.
**Verify:** `pnpm tsc --noEmit` passes.

### Step 5: Create the data table component
**File:** `src/components/dashboard/AdminDataTable.tsx`
**Change:** Create a reusable data table component for displaying paginated lists of courses, users, and enrollments.
**Why:** Reusable component for displaying tabular data in the admin dashboard.
**Verify:** `pnpm tsc --noEmit` passes.

### Step 6: Create a dashboard stats service
**File:** `src/services/dashboard-stats.ts`
**Change:** Create a service that aggregates dashboard statistics from Payload collections (count of enrollments, average completion rate, grade distributions).
**Why:** Follows service layer pattern, keeps page component thin.
**Verify:** `pnpm tsc --noEmit` passes and `pnpm test:int` passes.

## Critical Files
- `src/app/(frontend)/admin-dashboard/page.tsx` — new page (Server Component)
- `src/components/dashboard/StatsCard.tsx` — new component
- `src/components/dashboard/EnrollmentChart.tsx` — new component (Client Component)
- `src/components/dashboard/GradesChart.tsx` — new component (Client Component)
- `src/components/dashboard/AdminDataTable.tsx` — new component
- `src/services/dashboard-stats.ts` — new service

## Reused Patterns
- Server Component pattern from `src/app/(frontend)/dashboard/page.tsx` — fetches Payload data directly
- Component file naming: PascalCase per conventions
- Service layer: follows `src/services/gradebook.ts` pattern with typed deps
- Dashboard CSS: follows existing inline style patterns in `CourseProgressCard.tsx`

## Verification
1. Run `pnpm tsc --noEmit` — confirm zero type errors
2. Run `pnpm test:int` — confirm all tests pass
3. Start dev server (`pnpm dev`) and verify `/admin-dashboard` renders correctly
4. Browser verification: charts render, data tables show data
