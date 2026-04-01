# Plan: Redesign Authentication System with OAuth2 and RBAC

## Context

The existing auth system in `src/auth/` already has:
- JWT-based authentication with access/refresh tokens
- Token rotation on refresh (blacklists old refresh token)
- Session management with generation tracking
- OAuth2 providers (Google, GitHub) with PKCE support

**Gaps to fill:**
1. No support for linking multiple OAuth providers to a single user account
2. User schema lacks `provider_id`, `provider_type`, `linked_accounts` fields
3. RBAC roles are `admin | instructor | student | user | guest` — need `admin | editor | viewer`
4. No database migration for the new fields
5. Access control needs to be applied to all API routes

---

## Step 1: Update User schema and UserStore to support OAuth provider linking

**File:** `src/auth/user-store.ts`
**Change:** Add OAuth provider fields to User interface and UserStore methods:
```typescript
export interface LinkedAccount {
  provider: OAuth2Provider
  providerId: string
  linkedAt: Date
}

export interface User {
  // ... existing fields
  provider?: OAuth2Provider        // Primary provider for OAuth users
  providerId?: string             // Provider-specific user ID
  linkedAccounts?: LinkedAccount[] // Additional linked providers
}

async linkAccount(userId: string, provider: OAuth2Provider, providerId: string): Promise<void>
async unlinkAccount(userId: string, provider: OAuth2Provider): Promise<void>
async findByProvider(provider: OAuth2Provider, providerId: string): Promise<User | undefined>
```
**Why:** Enable multiple OAuth providers per user account
**Verify:** `pnpm test:int -- src/auth/user-store.test.ts`

---

## Step 2: Add RBAC roles (admin, editor, viewer) to type definitions

**File:** `src/auth/user-store.ts`
**Change:** Update `UserRole` type:
```typescript
export type UserRole = 'admin' | 'editor' | 'viewer' | 'instructor' | 'student'
```
**Why:** Task requires admin, editor, viewer roles
**Verify:** `pnpm test:int -- src/auth/user-store.test.ts`

---

## Step 3: Update AuthController with OAuth linking methods

**File:** `src/auth/authController.ts`
**Change:** Add methods:
```typescript
async linkOAuthProvider(userId: string, provider: OAuth2Provider, providerId: string): Promise<void>
async unlinkOAuthProvider(userId: string, provider: OAuth2Provider): Promise<void>
async getLinkedAccounts(userId: string): Promise<LinkedAccount[]>
async handleOAuthRegister(userInfo: OAuth2UserInfo): Promise<AuthResult>
async handleOAuthLink(userId: string, userInfo: OAuth2UserInfo): Promise<void>
```
**Why:** OAuth linking/unlinking requires controller methods
**Verify:** `pnpm test:int -- src/auth/authController.test.ts`

---

## Step 4: Create migration for OAuth fields

**File:** `src/migrations/20260401_000000_oauth_providers.ts`
**Change:** Add migration to add `provider`, `provider_id`, `linked_accounts` columns to users table
**Why:** Database schema change for new fields
**Verify:** `pnpm payload migrate`

---

## Step 5: Add OAuth callback handler for linking flow

**File:** `src/api/auth/oauth-link.ts`
**Change:** New API route to link OAuth account to existing user session
**Why:** Users need an endpoint to link OAuth provider to their existing account
**Verify:** `pnpm test:int -- src/api/auth/oauth-link.test.ts`

---

## Step 6: Update role-guard to support new roles

**File:** `src/middleware/role-guard.ts`
**Change:** Support new `editor` and `viewer` roles alongside existing roles
**Why:** Middleware must enforce new RBAC roles
**Verify:** `pnpm test:int -- src/middleware/role-guard.test.ts`

---

## Step 7: Update auth-middleware to handle new session structure

**File:** `src/middleware/auth-middleware.ts`
**Change:** Ensure middleware works with new User type that includes OAuth fields
**Why:** Middleware extracts user from JWT and validates session
**Verify:** `pnpm test:int -- src/middleware/auth-middleware.test.ts`

---

## Step 8: Apply RBAC to all API routes

**File:** `src/api/auth/*.ts`
**Change:** Add role checks to login, register, profile, refresh, logout routes
**Why:** Every API route must enforce role-based access
**Verify:** `pnpm test:int -- src/api/auth/`

---

## Step 9: Add integration tests for OAuth linking flow

**File:** `src/auth/auth-flow.test.ts`
**Change:** Test full OAuth register → link → unlink flow
**Why:** Comprehensive test coverage for new linking feature
**Verify:** `pnpm test:int -- src/auth/auth-flow.test.ts`

---

## Step 10: Run full test suite and type check

**Change:** Run `pnpm test:int && pnpm test:e2e && pnpm tsc --noEmit`
**Why:** Verify all changes work together
**Verify:** All tests pass

---

## Questions

- **Role hierarchy:** Should `admin` supersede `editor` and `viewer` (i.e., admin can do everything editor can)? Or are these strictly separate roles?
- **Migration scope:** Should the migration also convert existing users to one of the new roles (admin | editor | viewer), or should we keep the existing roles (instructor, student) and add editor/viewer as new?
- **OAuth linking UX:** Should linking require password confirmation if the account has a password, or is linking via active session sufficient?
