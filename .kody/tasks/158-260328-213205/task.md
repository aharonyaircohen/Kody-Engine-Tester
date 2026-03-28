# Add health check endpoint

Add a simple health check API endpoint.

**File:** `src/app/api/health/route.ts`

**Requirements:**
- GET /api/health returns { status: 'ok', timestamp: ISO string, version: from package.json }
- Include a simple uptime counter (process uptime in seconds)
- Return 200 status code

**Include a test** in `src/app/api/health/route.test.ts` that verifies the response shape and status code.