## Plan

**Step 1: Install bcryptjs dependency**

**File:** `package.json`
**Change:** Add `bcryptjs` to dependencies and `@types/bcryptjs` to devDependencies
**Why:** Task requires bcrypt with cost factor 12 for password hashing
**Verify:** `pnpm install`

---

**Step 2: Create the User model**

**File:** `src/models/user.model.ts`
**Change:** Create User interface with `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`, plus `UserModel` class with `create`, `findByEmail`, `verifyPassword`, `hashPassword` methods using bcrypt (cost 12)
**Why:** Task acceptance criteria requires these exact fields and bcrypt hashing
**Verify:** `pnpm test:int -- --run src/models/user.model.test.ts`

---

**Step 3: Create unit tests for User model**

**File:** `src/models/user.model.test.ts`
**Change:** Write tests covering: user creation, password hashing verification, edge cases (empty email, invalid email format, duplicate email)
**Why:** TDD approach — tests before implementation per methodology
**Verify:** `pnpm test:int -- --run src/models/user.model.test.ts`

---

## Existing Patterns Found

- **`src/models/notification.ts`**: Model file location and JSDoc comment convention
- **`src/auth/user-store.ts`**: UserStore class pattern with Map-based storage, password hashing interface (create, findByEmail, verifyPassword)
- **`src/auth/user-store.test.ts`**: describe/it vitest testing patterns with beforeEach setup

## Questions

- The existing `UserStore` uses SHA-256 and `AuthService` uses PBKDF2. This new model uses bcrypt per the task requirements. Should it remain completely independent from the existing auth systems, or would sharing a common password verification interface be beneficial?
