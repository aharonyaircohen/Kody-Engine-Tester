
### taskify (2026-04-10T12:48:54)
{
  "task_type": "feature",
  "title": "Add pagination helper",
  "description": "Create `paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; pages: number; hasNext: boolean }` in `src/services/pagination.ts` with comprehensive tests. The function should slice the array for the requested page and calculate total pages and hasNext flag.",
  "scope": ["src/services/pagination.ts", "src/services/pagination.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
 
...(truncated)

### build (2026-04-10T12:51:06)
The pagination helper has been implemented successfully.

**Created files:**
- `src/services/pagination.ts` - The pagination function with JSDoc, generic type support, and input validation
- `src/services/pagination.test.ts` - 12 tests covering all edge cases

**Implementation:**
- `paginate<T>(items: T[], page: number, pageSize: number)` returns `{ data: T[]; total: number; pages: number; hasNext: boolean }`
- 1-indexed pages (standard pagination)
- Input validation: throws errors for `pageSize
...(truncated)
