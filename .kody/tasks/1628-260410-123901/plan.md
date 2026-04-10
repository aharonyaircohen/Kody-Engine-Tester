Now I have a complete picture of the dual auth systems. Let me write the plan.

## Pattern Discovery Report

**Dual Auth Systems Found:**
- **UserStore-based** (`src/auth/user-store.ts`): SHA-256 hashing, in-memory, UserRole: `admin|user|guest|student|instructor`
- **AuthService-based** (`src/auth/auth-service.ts`): PBKDF2 hashing (Payload-compatible), RbacRole: `admin|editor|viewer`

**UserStore Dependencies (must migrate or remove):**
- `src/api/auth/login.ts` - login endpoint
- `src/middleware/auth-middleware.ts` - Express-style auth middleware
- `src/middleware/role-guard.ts` - role checking
- `src/services/discussions.ts` - DiscussionService uses `User` type and `instructor` role
- `src/auth/index.ts` - exports UserStore singleton

**Existing Production Auth:**
- `src/auth/withAuth.ts` HOC wraps routes with JWT validation via AuthService
- `src/auth/_auth.ts` provides `extractBearerToken` and `checkRole` with role hierarchy

**Key Issue:** DiscussionService references `instructor` role which doesn't exist in RbacRole (`admin|editor|viewer`). Role alignment required.

---

## Plan

**Step 1: Audit remaining UserStore dependencies**

**File:** `src/auth/user-store.test.ts`
**Change:** Read existing tests to understand UserStore test patterns
**Verify:** `pnpm test:int src/auth/user-store.test.ts`

---

**Step 2: Add integration test for AuthService login flow**

**File:** `src/auth/auth-service.test.ts`
**Change:** Verify AuthService.login() works correctly with Payload users collection (read existing test patterns first)
**Verify:** `pnpm test:int src/auth/auth-service.test.ts`

---

**Step 3: Migrate login API from UserStore to AuthService**

**File:** `src/api/auth/login.ts`
**Change:** Replace UserStore-based login with AuthService.login(). Remove UserStore import and dependency injection. Update return type to use AuthService types.
**Why:** Consolidate to single auth system; AuthService uses PBKDF2 (Payload-compatible) vs SHA-256 in UserStore
**Verify:** `pnpm test:int src/api/auth/login.test.ts`

---

**Step 4: Update DiscussionService role references**

**File:** `src/services/discussions.ts`
**Change:** Replace `user.role !== 'instructor' && user.role !== 'admin'` with `user.role !== 'admin' && user.role !== 'editor'`. Import `AuthenticatedUser` from auth-service instead of `User` from user-store.
**Why:** Align with RbacRole (admin|editor|viewer); instructor permissions map to editor
**Verify:** `pnpm test:int src/services/discussions.test.ts`

---

**Step 5: Update role-guard to use AuthenticatedUser**

**File:** `src/middleware/role-guard.ts`
**Change:** Import `AuthenticatedUser` from auth-service instead of `User` from user-store. Remove user-store import.
**Why:** Use production auth type consistently
**Verify:** `pnpm test:int src/middleware/role-guard.test.ts`

---

**Step 6: Deprecate UserStore in auth index**

**File:** `src/auth/index.ts`
**Change:** Remove `userStore` export or mark as deprecated. Keep type exports暂时ly for migration. Add AuthService exports.
**Why:** Signal that UserStore is no longer the primary auth store
**Verify:** `pnpm build`

---

**Step 7: Run full test suite**

**Verify:** `pnpm test:int && pnpm build`
