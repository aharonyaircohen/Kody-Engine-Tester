# Plan: P3T36 — Engine-managed dev server (Admin Dashboard)

## Context

The previous build attempt (`approve`` task) ran out of budget at `2026-04-18T00:13:15Z` while fixing a type cast in `admin-dashboard/page.tsx`. However, the crash occurred **after** all the required files were already created and written successfully. The implementation is already complete and type-checks cleanly — the agent simply ran out of budget before running verification commands.

**Task goal:** Add a new admin dashboard page (`/admin-dashboard`) with charts (enrollment trends, grade distribution) and data tables (courses, users, enrollments) powered by a `DashboardStatsService`.

**What the previous agent created (all already exist):**
- `src/services/dashboard-stats.ts` — `DashboardStatsService` aggregating stats from Payload collections
- `src/app/(frontend)/admin-dashboard/page.tsx` — Server component page
- `src/app/api/admin-dashboard/route.ts` — Authenticated GET API route with pagination
- `src/components/dashboard/StatsCard.tsx` — Stat summary card
- `src/components/dashboard/EnrollmentChart.tsx` — SVG bar chart for enrollment trends
- `src/components/dashboard/GradesChart.tsx` — SVG horizontal bar chart for grade distribution
- `src/components/dashboard/AdminDataTable.tsx` — Paginated data table with Previous/Next
- `src/components/dashboard/AdminDashboardTables.tsx` — Tabbed table panel (courses/users/enrollments)

## What Still Needs to Be Done

### Step 1 — Run lint check
```bash
pnpm lint
```
Fix any ESLint violations in the new files if present.

### Step 2 — Verify dev server lifecycle (KODY_DEV_SERVER_READY)
The `kody.config.json` already has dev server configured:
```json
"devServer": {
  "command": "pnpm dev",
  "url": "http://localhost:3000"
}
```
Start the dev server and verify it starts without errors:
```bash
nohup pnpm dev > /tmp/dev-server.log 2>& &
sleep 15
grep -i "KODY_DEV_SERVER_READY\|ready\|started" /tmp/dev-server.log | head -10
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
kill %1 2>/dev/null || true
```

### Step 3 — Browser visual verification
- Start dev server
- Take screenshot of `/admin-dashboard` (should show stats cards, charts, data tables)
- Kill dev server

### Step 4 — Run tests (summary)
```bash
pnpm test:int 2>&1 | tail -15
```
Expected: 127 passed, 1 pre-existing DB failure in `api.int.spec.ts` (unrelated to dashboard).

## Files Modified
| File | Change |
|------|--------|
| `src/services/dashboard-stats.ts` | Created — `DashboardStatsService` with `getSummary`, `getEnrollmentTrends`, `getGradeDistribution`, `getCourses`, `getUsers`, `getRecentEnrollments` |
| `src/app/(frontend)/admin-dashboard/page.tsx` | Created — server component rendering stats + charts + tables |
| `src/app/api/admin-dashboard/route.ts` | Created — GET API route with `withAuth` and RBAC `['admin', 'editor']` |
| `src/components/dashboard/StatsCard.tsx` | Created |
| `src/components/dashboard/EnrollmentChart.tsx` | Created — SVG bar chart |
| `src/components/dashboard/GradesChart.tsx` | Created — SVG horizontal bar chart |
| `src/components/dashboard/AdminDataTable.tsx` | Created — generic paginated table |
| `src/components/dashboard/AdminDashboardTables.tsx` | Created — tabbed panel |

## Verification
1. `pnpm tsc --noEmit` → zero errors in dashboard files (confirmed: grep returned nothing)
2. `pnpm lint` → no new violations
3. Dev server starts → `KODY_DEV_SERVER_READY` or "ready" appears in logs
4. Browser: `/admin-dashboard` renders stats cards, charts, data tables
5. `pnpm test:int` → 127 passed (pre-existing DB failure is unrelated)
