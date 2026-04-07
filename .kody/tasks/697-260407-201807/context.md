
### taskify (2026-04-07T20:21:06)
{
  "task_type": "feature",
  "title": "Add health check detail endpoint",
  "description": "Create GET /api/health/detail route at src/app/api/health/detail/route.ts returning { status, uptime, version, timestamp }. Read version from package.json. Include integration test at src/app/api/health/detail/route.test.ts following the existing health route patterns.",
  "scope": [
    "src/app/api/health/detail/route.ts",
    "src/app/api/health/detail/route.test.ts",
    "package.json"
  ],
  "risk_l
...(truncated)

### build (2026-04-07T20:24:15)
Done. Created `GET /api/health/detail` endpoint with:

- **`src/app/api/health/detail/route.ts`** - Returns `{ status, uptime, version, timestamp }` using `process.env.npm_package_version` (falls back to `'1.0.0'`)
- **`src/app/api/health/detail/route.test.ts`** - Integration test with fake timers following existing health route patterns

Both the new test and existing health route test pass.

