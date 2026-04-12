
### taskify (2026-04-12T08:15:58)
```json
{
  "task_type": "bugfix",
  "title": "Revert PR #2024 groupBy signature change",
  "description": "Revert changes from PR #2024 which changed groupBy function signature from keyFn callback to direct key parameter. Restore original implementation with signature groupBy<T>(items: readonly T[], keyFn: (item: T) => string). This includes both src/utils/group-by.ts and src/utils/group-by.test.ts.",
  "scope": [
    "src/utils/group-by.ts",
    "src/utils/group-by.test.ts"
  ],
  "risk_level"
...(truncated)

### build (2026-04-12T08:18:46)
The revert is complete. Here's a summary of the changes:

**`src/utils/group-by.ts`** - Restored original signature:
- Changed from `key: K extends keyof T` (direct key parameter) 
- Back to `keyFn: (item: T) => string` (callback function)

**`src/utils/group-by.test.ts`** - Updated tests to use callback pattern:
- All tests now use `(item) => item.property` callback syntax
- Fixed TypeScript issue with empty array type inference

The function signature is now restored to:
```typescript
groupBy<
...(truncated)
