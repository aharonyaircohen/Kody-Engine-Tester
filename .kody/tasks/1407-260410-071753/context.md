
### taskify (2026-04-10T07:22:45)
{
  "task_type": "feature",
  "title": "Add health check detail endpoint",
  "description": "Add GET /api/health/detail route in src/app/api/health/detail/route.ts returning { status, uptime, version, timestamp }. Version is read from package.json at runtime using process.cwd(). Includes integration test following existing vitest patterns with fake timers.",
  "scope": [
    "src/app/api/health/detail/route.ts",
    "src/app/api/health/detail/route.test.ts"
  ],
  "risk_level": "low",
  "existin
...(truncated)

### build (2026-04-10T07:24:50)
The TypeScript errors are pre-existing issues in the `.next` folder (Next.js generated types for Pages Router), not related to the health detail endpoint.

**Summary:** The implementation is already complete:
- `src/app/api/health/detail/route.ts` — Returns `{ status, uptime, version, timestamp }` with version read from `package.json` at runtime using `process.cwd()`
- `src/app/api/health/detail/route.test.ts` — Integration test with fake timers following existing patterns

The test passes succe
...(truncated)
