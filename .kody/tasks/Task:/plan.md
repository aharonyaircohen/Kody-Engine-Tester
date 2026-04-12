## Plan

**Step 1: Create BarChart SVG component for displaying metrics**
**File:** `src/components/dashboard/BarChart.tsx`
**Change:** New file with SVG-based bar chart component following the same pattern as ProgressRing
**Why:** Reuse existing SVG chart pattern from ProgressRing - no external dependencies needed
**Verify:** `pnpm tsc --noEmit` passes

**Step 2: Create DataTable component for tabular data**
**File:** `src/components/dashboard/DataTable.tsx`
**Change:** New file with accessible HTML table component with sorting capability
**Why:** Reuse existing dashboard component patterns - single-responsibility, styled with inline styles matching existing cards
**Verify:** `pnpm tsc --noEmit` passes

**Step 3: Create analytics dashboard page**
**File:** `src/app/(frontend)/dashboard/analytics/page.tsx`
**Change:** New server component page at /dashboard/analytics with BarChart and DataTable displaying mock course metrics
**Why:** Follows existing dashboard/page.tsx patterns - server component with async data fetching using Payload
**Verify:** `pnpm tsc --noEmit` passes

**Step 4: Add hasUI: true to task.json**
**File:** `.kody/tasks/Task:/task.json`
**Change:** Add `"hasUI": true` to the task.json object
**Why:** Required verification criterion - signals to the engine that Playwright MCP should be auto-injected for UI verification stages
**Verify:** JSON is valid

**Step 5: Add E2E test for analytics dashboard**
**File:** `tests/e2e/dashboard-analytics.e2e.spec.ts`
**Change:** New Playwright test navigating to /dashboard/analytics and verifying chart and table elements render
**Why:** Follows existing frontend.e2e.spec.ts pattern for E2E coverage
**Verify:** `pnpm test:e2e` passes (requires dev server running)

**Step 6: Add unit test for BarChart component**
**File:** `src/components/dashboard/BarChart.test.tsx`
**Change:** New Vitest test for BarChart rendering with sample data
**Why:** TDD - test co-located with source following existing patterns (e.g., ProgressRing.test.tsx)
**Verify:** `pnpm test:int` passes

## Existing Patterns Found

- **SVG Chart Pattern**: `src/components/dashboard/ProgressRing.tsx` uses pure SVG for circular progress - reuse for BarChart
- **Dashboard Card Pattern**: `src/components/dashboard/CourseProgressCard.tsx` uses inline styles with border/padding/radius - apply to DataTable
- **Server Component Pattern**: `src/app/(frontend)/dashboard/page.tsx` is async server component fetching from Payload - apply to analytics page
- **Test Colocation**: `src/components/dashboard/ProgressRing.test.tsx` exists - follow same pattern for BarChart test
