# Refactor: consolidate duplicate error response helpers across API routes

## Refactor

Multiple API route files manually construct error response objects with duplicated patterns like:
\`\`\`ts
return new Response(JSON.stringify({ error: "..." }), { status: 4xx, headers: { "Content-Type": "application/json" } })
\`\`\`

**Goal:** Extract a shared \`createErrorResponse(message, status)\` helper and a \`createJsonResponse(data, status?)\` helper.

**Files to create:**
- \`src/utils/api-response.ts\` — the helpers
- \`src/utils/api-response.test.ts\` — tests

**Then update** existing route files to use the helpers instead of inline Response construction.

**Complexity:** medium