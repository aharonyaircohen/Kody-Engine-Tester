Now I have enough context. Here's the implementation plan:

## Step 1: Create the shared helpers module
**File:** `src/utils/api-response.ts`
**Change:** Write a new file exporting `createErrorResponse(message, status)` and `createJsonResponse(data, status?)`.
**Why:** Centralizes the repeated `new Response(JSON.stringify(...), { headers: {...} })` pattern.
**Verify:** `pnpm test -- src/utils/api-response.test.ts` (after step 2)

## Step 2: Write tests for the helpers
**File:** `src/utils/api-response.test.ts`
**Change:** Write tests covering both functions — verify status codes, Content-Type header, body shape.
**Why:** TDD ordering — tests validate the contract before consumers are updated.
**Verify:** `pnpm test -- src/utils/api-response.test.ts`

## Step 3: Update `src/app/api/quizzes/[id]/route.ts`
**Change:** Replace the 2 inline Response constructions (lines 20–24, 33–48) with `createErrorResponse` and `createJsonResponse`.
**Verify:** `pnpm typecheck` passes

## Step 4: Update `src/app/api/quizzes/[id]/attempts/route.ts`
**Change:** Replace the 1 inline Response construction (lines 14–18) with `createErrorResponse`.
**Verify:** `pnpm typecheck` passes

## Step 5: Update `src/app/api/quizzes/[id]/submit/route.ts`
**Change:** Replace 4 inline Response constructions (lines 16–19, 24–31, 44–47, 80–90, 112–115) with the helpers.
**Verify:** `pnpm typecheck` passes

## Step 6: Update `src/app/api/enroll/route.ts`
**Change:** Replace 6 inline Response constructions (lines 17–20, 25–28, 36–39, 55–58, 80–83, 98–101) with the helpers.
**Verify:** `pnpm typecheck` passes

## Step 7: Update `src/app/api/csrf-token/route.ts`
**Change:** Replace 2 inline Response constructions (lines 8–14, 20–26) with the helpers.
**Verify:** `pnpm typecheck` passes

## Step 8: Run full test suite
**Change:** `pnpm test && pnpm typecheck`
**Verify:** All tests pass and no type errors
