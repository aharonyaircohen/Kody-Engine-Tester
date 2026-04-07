# Add role-based access control middleware

## Task
Create a reusable RBAC middleware in `src/middleware/rbac.ts` that checks user roles before allowing access to protected routes.

## Requirements
- Export: `requireRole(...roles: string[]): NextMiddleware`
- Check the user's role from the JWT token (use existing `JwtService`)
- Return 403 if user lacks required role
- Support multiple allowed roles (OR logic)
- Add integration tests in `tests/int/rbac.int.spec.ts`
- Update `src/app/api/gradebook/course/[id]/route.ts` to use the new middleware (require 'admin' or 'editor' role)

## Acceptance Criteria
- Middleware correctly blocks unauthorized users
- Existing gradebook endpoint uses new middleware
- Tests cover: valid role, invalid role, missing token, expired token