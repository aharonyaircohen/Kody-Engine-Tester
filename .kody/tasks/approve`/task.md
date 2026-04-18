# [run-20260418-0344] P3T36: Engine-managed dev server

Verify engine starts/stops dev server for UI tasks.

Task: Add a new dashboard page with charts and data tables.

Command: @kody

## Verification
Logs show KODY_DEV_SERVER_READY and dev server lifecycle.

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-18):
@kody

Task: Add a new dashboard page with charts and data tables.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `Task:`

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. What chart types are needed? Progress summary bar chart, grade trend line chart, assignment completion bar chart, course distribution pie chart?
2. Should charts use pure inline SVG (matching existing ProgressRing pattern, no new deps) or should a chart library like recharts be added as a dependency?
3. What should the data tables display — assignment submissions, grade history, or enrollment details — and should they replace the existing RecentActivity/UpcomingDeadlines lists or be added alongside them?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

