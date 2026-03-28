# Refactor: extract auth middleware into composable pipeline

The auth middleware (`src/middleware/auth-middleware.ts`), role guard (`src/middleware/role-guard.ts`), and rate limiter (`src/middleware/rate-limiter.ts`) are applied separately in each API route. This leads to duplicated boilerplate.

**Refactor into:**
1. A `createMiddlewarePipeline(...middlewares)` function in `src/middleware/pipeline.ts`
2. Pre-built pipelines: `authenticatedRoute`, `instructorRoute`, `adminRoute`, `publicRoute` (rate limit only)
3. Each pipeline composes auth check → role guard → rate limiter in the correct order

**Example usage:**
```ts
const handler = instructorRoute(async (req, context) => {
  // context.user is guaranteed to be an instructor here
})
```

**Constraints:** Do not change the behavior of any existing middleware. All existing tests must pass. Add tests for the pipeline composition.