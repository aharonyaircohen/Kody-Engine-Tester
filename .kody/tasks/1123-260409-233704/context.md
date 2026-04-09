
### taskify (2026-04-09T23:39:36)
```json
{
  "task_type": "feature",
  "title": "Add role hierarchy permission checker",
  "description": "Create `hasPermission(userRole: string, requiredRole: string): boolean` in `src/auth/role-hierarchy.ts` with hierarchy admin > editor > viewer > guest. Higher roles inherit lower role permissions. Include co-located tests following the existing single-function utility pattern.",
  "scope": ["src/auth/role-hierarchy.ts", "src/auth/role-hierarchy.test.ts"],
  "risk_level": "low",
  "existing_p
...(truncated)

### build (2026-04-09T23:41:42)
The implementation is complete. Here's a summary:

## Created Files

**`src/auth/role-hierarchy.ts`**
- `hasPermission(userRole: string, requiredRole: string): boolean`
- Hierarchy: admin (3) > editor (2) > viewer (1) > guest (0)
- Higher roles inherit lower role permissions
- Unknown user roles return `false`
- Unknown required roles return `true` (no specific requirement)

**`src/auth/role-hierarchy.test.ts`**
- 9 tests covering exact matches, hierarchical inheritance, unknown roles, and edge 
...(truncated)
