
### taskify (2026-04-09T21:56:14)
{
  "task_type": "feature",
  "title": "Add role hierarchy checker",
  "description": "Create `hasPermission(userRole: string, requiredRole: string): boolean` in `src/auth/role-hierarchy.ts` with hierarchy admin > editor > viewer > guest. Higher roles inherit permissions of lower roles (e.g., editor can do anything viewer can). Include comprehensive tests.",
  "scope": ["src/auth/role-hierarchy.ts", "src/auth/role-hierarchy.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth
...(truncated)

### build (2026-04-09T21:58:33)
Implementation complete. Created:

- **`src/auth/role-hierarchy.ts`** - Exports `ROLE_HIERARCHY` (admin:3, editor:2, viewer:1, guest:0) and `hasPermission(userRole: string, requiredRole: string): boolean`
- **`src/auth/role-hierarchy.test.ts`** - 22 comprehensive tests covering exact matches, hierarchical inheritance, insufficient permissions, and unknown roles

All 22 tests pass with no TypeScript errors in the new files.

