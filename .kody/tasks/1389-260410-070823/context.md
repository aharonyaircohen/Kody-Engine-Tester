
### taskify (2026-04-10T07:10:39)
```json
{
  "task_type": "feature",
  "title": "Add role hierarchy checker",
  "description": "Create `hasPermission(userRole: string, requiredRole: string): boolean` in `src/auth/role-hierarchy.ts` with hierarchy admin > editor > viewer > guest (where admin has all permissions, guest has the least). Include co-located tests following the existing vitest pattern used in src/utils/*.test.ts. The function should accept string arguments for flexibility but define the valid roles as a union type.",

...(truncated)

### build (2026-04-10T07:13:26)
The TypeScript errors are pre-existing in the codebase and not related to my changes. My implementation is complete.

## Summary

Created `src/auth/role-hierarchy.ts` with:
- `Role` union type: `'admin' | 'editor' | 'viewer' | 'guest'`
- `ROLE_HIERARCHY` record with numeric levels (admin=3 > editor=2 > viewer=1 > guest=0)
- `hasPermission(userRole: string, requiredRole: string): boolean` function that returns `true` if user has sufficient permissions, `false` for invalid roles

Created `src/auth
...(truncated)
