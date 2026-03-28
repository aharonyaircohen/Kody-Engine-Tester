
### taskify (2026-03-28T20:53:09)
The refactoring is complete. Here's a summary of what was implemented:

## Summary

Created `src/middleware/pipeline.ts` with:

### Core Function: `createMiddlewarePipeline`
Composes multiple middleware functions that process context in order. Each middleware can:
- Return `NextResponse` to short-circuit the pipeline
- Return modified context for the next middleware

### Pipeline Middleware Helpers:
- `createPipelineAuthMiddleware(userStore, sessionStore, jwtService)` - Adds user/session to cont
...(truncated)

### plan (2026-03-28T20:53:26)

The refactoring implementation is complete and all tests pass. However, I notice a discrepancy between what was requested and what was built:

**Task requested:**
```ts
const handler = instructorRoute(async (req, context) => {
  // context.user is guaranteed to be an instructor here
})
```

**Current implementation uses factory functions:**
```ts
const handler = createInstructorRoute(userStore, sessionStore, jwtService, async (ctx) => {
  // ctx.user is guaranteed to be an instructor here
})
``
...(truncated)

### build (2026-03-28T20:56:50)
**Build complete.** All middleware and auth tests pass (124/124). The 21 failures in `Lessons.test.ts` are pre-existing (not caused by this change).

**Summary of changes:**

- **`src/middleware/pipeline.ts`** (new) — Core pipeline with:
  - `createMiddlewarePipeline()` — composes middleware in order, short-circuits on `NextResponse`
  - `createPipelineAuthMiddleware()` — adds user/session to context
  - `createPipelineRoleGuard()` — enforces role requirements
  - `createRouteHandler()` — wires 
...(truncated)
