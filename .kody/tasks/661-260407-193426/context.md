
### taskify (2026-04-07T19:37:10)
{
  "task_type": "feature",
  "title": "Add role hierarchy checker",
  "description": "Create hasPermission(userRole: string, requiredRole: string): boolean in src/auth/role-hierarchy.ts with hierarchy admin > editor > viewer > guest. A user role that is higher in the hierarchy has permission to access resources requiring a lower role. Includes comprehensive tests.",
  "scope": ["src/auth/role-hierarchy.ts", "src/auth/role-hierarchy.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    
...(truncated)

### build (2026-04-07T19:39:18)
Those are just module resolution issues when running `tsc` directly on test files. The project-wide `tsc --noEmit` confirms the pre-existing errors are unrelated to my changes.

**Summary:**

Created two files:

1. **`src/auth/role-hierarchy.ts`** - Exports:
   - `ROLE_HIERARCHY_LEVELS` - Record with `admin: 3, editor: 2, viewer: 1, guest: 0`
   - `hasPermission(userRole: string, requiredRole: string): boolean` - Returns `true` if user role >= required role in hierarchy

2. **`src/auth/role-hier
...(truncated)
