# Plan: Add Charts & Data Tables to Dashboard

## Context

The student dashboard (`src/app/(frontend)/dashboard/page.tsx`) currently shows course progress cards, upcoming deadlines, and recent activity. The task is to enhance it with:
1. **Charts** — progress bar chart, grade trend line chart, and course distribution pie chart using inline SVG (matching the existing `ProgressRing` SVG pattern, no new dependencies)
2. **Data tables** — assignment submissions and grade history table, added **alongside** the existing lists (not replacing them)

Answers to Kody's 3 questions (defaults chosen per plan skeleton + existing patterns):
- Chart types → all three: progress bar, grade trend line, course distribution pie
- Chart library → **pure inline SVG** (zero new deps, consistent with `ProgressRing`)
- Data tables → assignment submissions + grade history, **added alongside** existing lists

---

## Files to Create

### 1. `src/components/dashboard/Charts.tsx`
Inline SVG charts — no external library.

- **`ProgressBarChart`** — horizontal SVG bar chart: one bar per course showing `progress %`. Reuses the `ProgressRing`-style SVG circle+bar pattern extended to a horizontal bar.
- **`GradeTrendChart`** — inline SVG polyline (line chart): x-axis = assignment/quiz timestamps, y-axis = score %. Connects points with a `<polyline>` and renders dots at each data point.
- **`CourseDistributionChart`** — SVG pie chart: one slice per course showing relative lesson counts. Uses `stroke-dasharray` on a `<circle>` (same technique as `ProgressRing` but with multiple segments).

Props:
```typescript
interface ChartsProps {
  courseCards: Array<{ courseTitle: string; percentage: number; grade: number | null }>
  gradeHistory: Array<{ date: string; score: number; label: string }>
}
```

### 2. `src/components/dashboard/DataTable.tsx`
Accessible HTML `<table>` with:
- **Grade History tab**: columns = Assignment/Quiz, Date, Score, Status (Pass/Fail)
- **Submissions tab**: columns = Assignment, Submitted At, Status, Grade

Tabs implemented as simple `<button>` toggle (no new dep). Empty state when no data.

Props:
```typescript
interface DataTableProps {
  submissions: Array<{
    id: string; assignment: string; submittedAt: string
    status: string; grade: number | null
  }>
  gradeHistory: Array<{
    id: string; label: string; date: string; score: number
    passed: boolean | null
  }>
}
```

---

## Files to Modify

### 3. `src/app/(frontend)/dashboard/page.tsx`
Update the server component to:
- Fetch quiz attempts and submissions data (already partially fetched — augment the existing queries)
- Compute grade history array from quiz attempts (date + score + label)
- Compute submission rows from `Submissions` collection
- Render `<Charts>` above the existing 2-column grid
- Render `<DataTable>` below the existing 2-column grid

No changes to auth/redirect logic.

---

## Patterns to Reuse

| Pattern | File | Usage |
|---|---|---|
| Inline SVG | `src/components/dashboard/ProgressRing.tsx` | SVG structure for Charts.tsx |
| `Result<T, E>` | `src/utils/result.ts` | Error handling in page |
| GradebookService | `src/services/gradebook.ts` | Data shape for grade entries |
| Existing types | `dashboard/RecentActivity.tsx` | `Activity` type pattern for component props |

---

## Verification

1. `pnpm tsc --noEmit` — zero type errors
2. `pnpm test:int` — all Vitest tests pass
3. Start dev server (`pnpm dev`), navigate to `/dashboard`, verify:
   - Charts render inline SVG (no external network requests for charts)
   - Data table tabs switch between grade history and submissions
   - Existing course progress cards still render
   - No console errors
4. Kill dev server when done
