
### taskify (2026-04-11T15:45:55)
All 17 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add content-type-guard middleware",
  "description": "Add a content-type-guard middleware that rejects requests with a body but no Content-Type header (400 error) while allowing requests without a body and requests with valid application/json or multipart/form-data Content-Type. Includes unit tests.",
  "scope": ["src/middleware/content-type-guard.ts", "src/middleware/content-type-guard.test.ts"],
...(truncated)

### build (2026-04-11T15:47:41)
The TypeScript errors shown are pre-existing issues in `node_modules/next` (not from our code). The `content-type-guard` implementation is complete and working.

**Summary:**

The task is already implemented:

- **`src/middleware/content-type-guard.ts`** - Middleware factory that:
  - Rejects requests with body but no Content-Type header (returns 400)
  - Allows requests without body regardless of Content-Type
  - Allows requests with body and valid Content-Type (`application/json`, `multipart/f
...(truncated)
