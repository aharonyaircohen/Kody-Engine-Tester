
### taskify (2026-04-05T06:02:03)

{
  "task_type": "feature",
  "title": "Complete JWT auth redesign with RBAC hierarchy and user schema migration",
  "description": "Complete authentication system redesign with: (1) JWT-based auth replacing session store for API routes via withAuth, (2) Migrate Users collection schema to add permissions array and lastLogin timestamp fields with a migration script, (3) Implement hierarchical RBAC where admin > editor > viewer role inheritance is enforced in checkRole, (4) Ensure all protected A
...(truncated)

### plan (2026-04-05T06:03:29)
Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **`src/auth/_auth.ts:26` - `checkRole` function**: Exact-match RBAC using `roles.includes(user.role)`. **Plan adds hierarchical support** by defining `ROLE_HIERARCHY = { admin: 3, editor: 2, viewer: 1 }` and comparing numeric levels.
- **`src/auth/auth-service.ts`**: Full JWT auth (login, refresh, verify, logout) with token rotation. **Plan updates `src/api/auth/*` handlers to delegate to this instead of Session
...(truncated)

### build (2026-04-05T06:11:08)
## Summary

All implementation tasks have been completed successfully. Here's what was changed:

### 1. Hierarchical RBAC in `src/auth/_auth.ts`
- Added `ROLE_HIERARCHY` constant: `admin (3) > editor (2) > viewer (1)`
- Updated `checkRole` to use numeric level comparison, allowing higher roles to access lower-role resources

### 2. Hierarchical RBAC in `src/middleware/role-guard.ts`
- Updated `requireRole` to use the same hierarchical RBAC logic
- Now properly enforces role inheritance (admin ca
...(truncated)

### review (2026-04-05T06:16:08)
## Verdict: PASS

## Summary

JWT-based authentication redesign completing: (1) hierarchical RBAC added to `checkRole` and `requireRole` via numeric `ROLE_HIERARCHY`, (2) `Users` collection extended with `permissions` (text) and `lastLogin` (timestamp) fields, (3) `logout.ts`, `refresh.ts`, `register.ts`, `profile.ts` migrated from `SessionStore`/`UserStore` to `AuthService`/Payload, (4) Payload migration script added for schema changes.

## Findings

### Critical

None.

### Major

- `src/migra
...(truncated)

### review-fix (2026-04-05T06:16:37)
**Fix complete.** Changed `permissions` column type from `varchar` to `text[]` (PostgreSQL array type) to properly store an array of permission strings.

- TypeScript: ✓ Zero errors
- Auth tests: ✓ 45 passed

