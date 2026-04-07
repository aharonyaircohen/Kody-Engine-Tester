
### build (2026-04-07T13:00:32)
The TypeScript errors are pre-existing in other files and not related to the new `capitalize.ts` I created. The new files have no type errors.

**Summary of implementation:**

Created `src/utils/capitalize.ts`:
```typescript
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
```

Created `src/utils/capitalize.test.ts` with 6 tests covering:
- Capitalizes first letter and lowercases the rest
- Lowercases rest
...(truncated)
