
### taskify (2026-04-07T18:09:58)
```json
{
  "task_type": "refactor",
  "title": "Refactor auth system with JWT migration and RBAC alignment",
  "description": "Complete JWT-based auth system: create missing roles.ts, migrate from HS256 to RS256 in jwt-service.ts, align UserRole with RbacRole types, add /api/auth/refresh endpoint, add token blacklist, and write migration scripts for existing users. Much of the JWT infrastructure already exists in jwt-service.ts and withAuth.ts — this task fills remaining gaps.",
  "scope": [
  
...(truncated)

### plan (2026-04-07T18:11:32)
Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- `src/auth/_auth.ts`: `ROLE_HIERARCHY`, `checkRole()`, `extractBearerToken()` — already exported by `withAuth.ts`; reused by `role-guard.ts`
- `src/auth/auth-service.ts`: `AuthService` with `login()`, `refresh()`, `verifyAccessToken()`, `logout()` — uses Payload + JwtService; pattern to preserve
- `src/auth/jwt-service.ts`: JWT signing/verification with token blacklist already implemented
- `src/middleware/role-g
...(truncated)

### build (2026-04-07T18:18:51)
## Summary

All steps completed successfully. Here's what was implemented:

### Files Created
1. **`src/auth/roles.ts`** — New RBAC module with `RbacRole` type, `ROLE_HIERARCHY`, `ROLE_PERMISSIONS`, and `hasPermission()` function
2. **`src/app/api/auth/login/route.ts`** — `POST /api/auth/login` endpoint using `AuthService.login()`
3. **`src/app/api/auth/refresh/route.ts`** — `POST /api/auth/refresh` endpoint using `AuthService.refresh()`
4. **`src/migrations/20260407_add_jwt_fields_to_users.ts`*
...(truncated)
