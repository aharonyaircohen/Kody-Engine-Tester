# Auth System Migration Guide

## Overview

This document describes the authentication system architecture and migration from session-based auth to JWT.

## Architecture

### Canonical Auth System: `AuthService`

The `AuthService` (`src/auth/auth-service.ts`) is the canonical authentication system:

- **Token Storage**: Payload DB (users collection)
- **Password Hashing**: PBKDF2 (25000 iterations, sha256, 512 bits) — matches Payload's `generatePasswordSaltHash`
- **JWT Tokens**: Access tokens (15 min) + Refresh tokens (7 days) with rotation

### Deprecated: `UserStore`

`UserStore` (`src/auth/user-store.ts`) is **deprecated**:

- Uses in-memory storage (lost on restart)
- Uses SHA-256 password hashing (weaker than PBKDF2)
- `UserRole` type has 5 values: `admin`, `user`, `guest`, `student`, `instructor`

**Do not use UserStore for new code.**

### Deprecated: `SessionStore`

`SessionStore` (`src/auth/session-store.ts`) is **deprecated**:

- Uses in-memory session storage
- Superseded by JWT approach in `jwt-service.ts` + `AuthService`

## Role System

### RbacRole (Canonical)

`RbacRole` (`src/auth/auth-service.ts`) has 3 values:

```typescript
type RbacRole = 'admin' | 'editor' | 'viewer'
```

| Role | Level | Permissions |
|------|-------|-------------|
| admin | 3 | Full access |
| editor | 2 | Can edit content |
| viewer | 1 | Read-only access |

### UserRole Mapping (Legacy → RBAC)

| Legacy UserRole | Maps to RbacRole | Notes |
|-----------------|------------------|-------|
| admin | admin | Unchanged |
| user | viewer | Most users are viewers |
| instructor | editor | Can create/edit content |
| student | viewer | Read-only access |
| guest | viewer | Read-only access |

## RBAC Utilities

### `checkRole` (Recommended)

Use `checkRole` from `src/auth/_auth.ts` for role validation:

```typescript
import { checkRole } from '@/auth/_auth'

const result = checkRole(user, ['admin', 'editor'])
if (result.error) {
  return Response.json({ error: result.error }, { status: result.status })
}
```

### `requireRole` (Middleware)

Use `requireRole` from `src/middleware/role-guard.ts` for middleware-style guards:

```typescript
import { requireRole } from '@/middleware/role-guard'

const guard = requireRole('admin', 'editor')
const result = guard({ user })
if (result) {
  return Response.json({ error: result.error }, { status: result.status })
}
```

### Single Import Point: `src/middleware/rbac.ts`

For convenience, import all RBAC utilities from one place:

```typescript
import { requireRole, checkRole, extractBearerToken, ROLE_HIERARCHY } from '@/middleware/rbac'
import type { RbacRole, AuthenticatedUser } from '@/middleware/rbac'
```

## withAuth HOC

All API routes should use the `withAuth` HOC:

```typescript
import { withAuth } from '@/auth/withAuth'

export const GET = withAuth(async (request, { user }) => {
  // user is AuthenticatedUser with { id, email, role }
  const payload = await getPayloadInstance()
  const data = await someService(payload).getForUser(String(user.id))
  return Response.json({ data })
}, { roles: ['admin', 'editor'] }) // optional role restriction
```

## Migration Checklist

- [ ] Replace `UserStore` with `AuthService` for new features
- [ ] Use `RbacRole` (`admin`, `editor`, `viewer`) instead of `UserRole`
- [ ] Use `checkRole` or `requireRole` for authorization checks
- [ ] Wrap API routes with `withAuth` HOC
- [ ] Remove direct `SessionStore` usage from route handlers

## Files

| File | Status | Description |
|------|--------|-------------|
| `src/auth/auth-service.ts` | Active | Canonical auth with JWT + Payload DB |
| `src/auth/jwt-service.ts` | Active | JWT signing/verification with blacklist |
| `src/auth/withAuth.ts` | Active | HOC wrapper for route handlers |
| `src/auth/_auth.ts` | Active | `checkRole`, `extractBearerToken`, `ROLE_HIERARCHY` |
| `src/auth/session-store.ts` | Deprecated | Session-based auth (in-memory) |
| `src/auth/user-store.ts` | Deprecated | In-memory user store with SHA-256 |
| `src/middleware/role-guard.ts` | Active | `requireRole` middleware |
| `src/middleware/rbac.ts` | Active | RBAC utilities re-export |
