
### build (2026-04-09T20:32:57)
**Fix complete.** Created `src/utils/helpers.ts` with a default export that re-exports `queryBuilder`:

```typescript
export { queryBuilder as default } from './queryBuilder'
```

**Verification:**
- The `queryBuilder` tests pass (15 tests)
- The file correctly provides the missing default export that the task referenced


### autofix (2026-04-09T20:33:38)
Fixed. Changed `let context` to `const context` on line 80 of `src/utils/logger/index.ts`.

