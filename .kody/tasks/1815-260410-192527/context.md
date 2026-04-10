
### taskify (2026-04-10T19:28:04)
{
  "task_type": "feature",
  "title": "Add pluralize utility function",
  "description": "Create a pluralize utility function in src/utils/pluralize.ts that takes a count and singular/plural forms, returning the count combined with the appropriate form (singular when count is 1, plural otherwise). Include co-located tests in src/utils/pluralize.test.ts.",
  "scope": ["src/utils/pluralize.ts", "src/utils/pluralize.test.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/debounce.ts —
...(truncated)

### build (2026-04-10T19:29:56)
The task is already complete. Here's a summary:

**Implementation** (`src/utils/pluralize.ts`):
```typescript
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}
```

**Tests** (`src/utils/pluralize.test.ts`): 5 tests covering:
- Count of 1 → singular form
- Count of 3 → plural form  
- Count of 0 → plural form
- Negative counts → plural form
- Large counts → plural form

**Verification**:
- All 5 tests pas
...(truncated)
