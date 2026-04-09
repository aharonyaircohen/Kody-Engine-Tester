
### taskify (2026-04-09T16:56:27)
All tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add role hierarchy permission checker",
  "description": "Create hasPermission(userRole: string, requiredRole: string): boolean in src/auth/role-hierarchy.ts with hierarchy admin > editor > viewer > guest. Includes comprehensive tests covering all role combinations and invalid role edge cases.",
  "scope": [
    "src/auth/role-hierarchy.ts",
    "src/auth/role-hierarchy.test.ts"
  ],
  "risk_level": 
...(truncated)

### build (2026-04-09T16:58:11)
The role hierarchy implementation is already complete and verified:

**Implementation** (`src/auth/role-hierarchy.ts`):
- `hasPermission(userRole: string, requiredRole: string): boolean` function
- Uses `ROLE_HIERARCHY` record: `guest: 0, viewer: 1, editor: 2, admin: 3`
- Returns `false` for undefined roles
- Uses numeric level comparison (`userLevel >= requiredLevel`)

**Tests** (`src/auth/role-hierarchy.test.ts`):
- 7 tests covering all hierarchy levels
- Tests admin > editor > viewer > guest 
...(truncated)
