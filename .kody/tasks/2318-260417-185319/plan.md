# Plan: Dashboard with Charts and Data Tables — 2318-260417-185319

## Context

The task is to enhance the existing student dashboard (`src/app/(frontend)/dashboard/page.tsx`) with **charts** and **data tables** as described in `task.md`. The current dashboard shows course progress cards and a basic list layout. This task adds visual analytics (grade trend chart) and a proper tabular view of course data.

**Critical constraints:**
- No chart/table libraries are installed (confirmed: no recharts, chart.js, tanstack-table)
- Dashboard is a Next.js server component; chart components must be `'use client'`
- CSS uses a global `styles.css` with inline `style={{}}` (consistent with existing pattern)

## Implementation Steps

### Step 1: Add recharts dependency
Install `recharts` — a React-native SVG chart library. It works in both server and client contexts but is used as a client component here.

```bash
cd /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester && pnpm add recharts
```

### Step 2: Create `GradeTrendChart` component (`src/components/dashboard/GradeTrendChart.tsx`)
A `'use client'` component using recharts `LineChart` to show quiz grade trends over time.

**Props:**
```typescript
interface GradeTrendPoint { date: string; score: number; label: string }
interface GradeTrendChartProps { data: GradeTrendPoint[] }
```

**Implementation:**
- Use `LineChart` with `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Line`
- Blue line (#3b82f6) matching existing `ProgressRing` color
- Responsive via `ResponsiveContainer`

### Step 3: Create `CoursesTable` component (`src/components/dashboard/CoursesTable.tsx`)
A `'use client'` data table component with sortable columns replacing the `CourseProgressCard` grid.

**Props:**
```typescript
interface CourseRow {
  id: string; courseTitle: string; percentage: number
  grade: number | null; status: string; nextLessonTitle: string | null
  nextLessonHref: string | null
}
interface CoursesTableProps { rows: CourseRow[] }
```

**Features:**
- Columns: Course Name, Progress (mini bar), Grade, Status badge, Next Lesson
- Sortable by clicking column headers (client-side sort)
- Status badge: color-coded (completed=green, active=blue, dropped=gray)
- Progress bar using inline `<div>` style (no chart library needed)

### Step 4: Create `OverallStats` component (`src/components/dashboard/OverallStats.tsx`)
Summary stat cards at the top of the dashboard.

**Props:**
```typescript
interface OverallStatsProps {
  totalCourses: number; completed: number
  inProgress: number; averageGrade: number | null
}
```

**Implementation:**
- 4 stat cards in a flex row: Total Courses, Completed, In Progress, Avg Grade
- Numbers displayed large; labels below
- Border and padding matching existing card styles

### Step 5: Update `dashboard/page.tsx` — wire up new components

**Enhancements to server-side data fetching:**
- Fetch all quiz attempts for the user (with `completedAt`) for grade trend chart
- Aggregate summary stats from `courseCards` data
- Pass `courses` (table rows), `gradeTrendData`, and `stats` to new components

**New page layout (top to bottom):**
1. `<h1>My Dashboard</h1>`
2. `<OverallStats {...stats} />` — stat cards row
3. `<GradeTrendChart data={gradeTrendData} />` — full-width chart
4. `<CoursesTable rows={courses} />` — data table
5. `<div grid>` — `UpcomingDeadlines` + `RecentActivity` side by side

## Critical Files

| File | Action |
|------|--------|
| `package.json` | Add recharts |
| `src/components/dashboard/GradeTrendChart.tsx` | New |
| `src/components/dashboard/CoursesTable.tsx` | New |
| `src/components/dashboard/OverallStats.tsx` | New |
| `src/app/(frontend)/dashboard/page.tsx` | Modify |

## Reused Patterns

- `ProgressRing.tsx` SVG style reused for consistent color palette
- `RecentActivity.tsx` `Activity` type reused
- `UpcomingDeadlines.tsx` `Deadline` type reused
- Server component + `'use client'` boundary pattern
- `inline style={{}}` consistent with existing components

## Verification

1. Start dev server: `pnpm dev` in project root
2. Navigate to `http://localhost:3000/dashboard` (or login → redirect)
3. Verify:
   - Overall stats bar with 4 numbers visible
   - Grade trend line chart renders (or "No grade data" if empty)
   - Courses table with sortable headers visible
   - Upcoming Deadlines + Recent Activity panels still present
4. Run `pnpm tsc --noEmit` — zero type errors
5. Run `pnpm test:int` — all tests pass
