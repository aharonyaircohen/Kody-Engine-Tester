
### taskify (2026-04-09T14:51:29)
All 19 tests pass.

```json
{
  "task_type": "feature",
  "title": "Add role hierarchy checker",
  "description": "Create hasPermission(userRole: string, requiredRole: string): boolean in src/auth/role-hierarchy.ts with hierarchy admin > editor > viewer > guest. Higher roles inherit permissions of lower roles. Includes comprehensive tests covering all role combinations and unknown role edge cases.",
  "scope": ["src/auth/role-hierarchy.ts", "src/auth/role-hierarchy.test.ts"],
  "risk_level": "lo
...(truncated)

### build (2026-04-09T14:53:04)
**Verified**: The implementation is complete and correct.

- `src/auth/role-hierarchy.ts` — implements `hasPermission(userRole, requiredRole)` with hierarchy `admin(3) > editor(2) > viewer(1) > guest(0)`, returns `false` for unknown roles
- `src/auth/role-hierarchy.test.ts` — 19 tests covering all role combinations and unknown role edge cases

All 19 tests pass.

