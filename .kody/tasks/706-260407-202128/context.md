
### taskify (2026-04-07T20:24:15)
{
  "task_type": "feature",
  "title": "Add role hierarchy permission checker",
  "description": "Create `hasPermission(userRole: string, requiredRole: string): boolean` function in `src/auth/role-hierarchy.ts` that returns true if the user's role has equal or higher privilege than the required role. Hierarchy: admin > editor > viewer > guest. Include comprehensive tests in `role-hierarchy.test.ts`.",
  "scope": ["src/auth/role-hierarchy.ts", "src/auth/role-hierarchy.test.ts"],
  "risk_level": "
...(truncated)

### build (2026-04-07T20:26:36)
The TypeScript errors are pre-existing issues unrelated to my changes (they're in pages and test helpers). My new files have no type errors.

**Summary of implementation:**

Created `src/auth/role-hierarchy.ts` with:
- `hasPermission(userRole: string, requiredRole: string): boolean` function
- Hierarchy: admin (3) > editor (2) > viewer (1) > guest (0)
- Returns `false` for unknown roles

Created `src/auth/role-hierarchy.test.ts` with 21 comprehensive tests covering:
- All role permission scenari
...(truncated)
