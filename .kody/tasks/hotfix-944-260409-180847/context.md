
### build (2026-04-09T18:12:25)
**Summary:**

Fixed the broken export in `src/utils/string-capitalizer.ts` by adding the missing default export.

**Changes made:**
- Created the file initially with only a named export (broken state)
- Fixed by adding `export default stringCapitalizer` alongside the named export

**Final state of `src/utils/string-capitalizer.ts`:**
```typescript
function stringCapitalizer(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export d
...(truncated)
