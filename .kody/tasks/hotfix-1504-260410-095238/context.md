
### build (2026-04-10T10:00:32)
The fix has been applied to `src/utils/queryBuilder.ts`. 

**Summary of changes:**
- Changed the function from `export function queryBuilder(...)` to a plain function declaration
- Added re-export statement at the end: `export { queryBuilder as queryBuilder, queryBuilder as default }`

This adds the missing default export while preserving the named export, allowing both import styles to work:
- `import { queryBuilder } from './queryBuilder'` (named import)
- `import queryBuilder from './queryBui
...(truncated)
