
### taskify (2026-04-09T17:39:53)
{
  "task_type": "feature",
  "title": "Add health check detail endpoint",
  "description": "Add GET /api/health/detail route in src/app/api/health/detail/route.ts returning { status, uptime, version, timestamp }. Read version from package.json. Include integration test following the existing health route test pattern (fake timers, response structure validation).",
  "scope": [
    "src/app/api/health/detail/route.ts",
    "src/app/api/health/detail/route.test.ts"
  ],
  "risk_level": "low",
  "
...(truncated)

### build (2026-04-09T17:44:34)
Implementation complete.

**Created files:**

1. **`src/app/api/health/detail/route.ts`** - `GET /api/health/detail` returning `{ status, uptime, version, timestamp }` by reading version from `package.json` using `fs.readFileSync`

2. **`src/app/api/health/detail/route.test.ts`** - Integration test following the existing health route pattern (fake timers, response structure validation)

**Verification:**
- `npx vitest run src/app/api/health/detail/route.test.ts` ✓ (1 test passed)
- `npx vitest r
...(truncated)
