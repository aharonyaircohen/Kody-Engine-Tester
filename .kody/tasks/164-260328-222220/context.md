
### taskify (2026-03-28T22:24:55)
{
  "task_type": "refactor",
  "title": "Consolidate duplicate error response helpers across API routes",
  "description": "Extract shared createErrorResponse(message, status) and createJsonResponse(data, status?) helpers into src/utils/api-response.ts, create tests, and update 5 API route files that manually construct Response objects with duplicated JSON/headers patterns.",
  "scope": [
    "src/utils/api-response.ts",
    "src/utils/api-response.test.ts",
    "src/app/api/quizzes/[id]/route.t
...(truncated)

### plan (2026-03-28T22:25:33)
Now I have enough context. Here's the implementation plan:

## Step 1: Create the shared helpers module
**File:** `src/utils/api-response.ts`
**Change:** Write a new file exporting `createErrorResponse(message, status)` and `createJsonResponse(data, status?)`.
**Why:** Centralizes the repeated `new Response(JSON.stringify(...), { headers: {...} })` pattern.
**Verify:** `pnpm test -- src/utils/api-response.test.ts` (after step 2)

## Step 2: Write tests for the helpers
**File:** `src/utils/api-re
...(truncated)

### build (2026-03-28T22:29:07)
All done. Here's a summary of what was implemented:

**New files:**
- `src/utils/api-response.ts` — exports `createErrorResponse(message, status)` and `createJsonResponse(data, status?, extraHeaders?)`
- `src/utils/api-response.test.ts` — 9 tests covering status codes, Content-Type header, and body serialization

**Updated files (all type-check clean):**
- `src/app/api/quizzes/[id]/route.ts` — 2 Response replacements
- `src/app/api/quizzes/[id]/attempts/route.ts` — 2 Response replacements
- `src
...(truncated)
