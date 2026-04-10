Created plan at `.kody/tasks/1338-260410-044448/plan.md` with 4 steps:

1. **Add bcrypt dependency** to `package.json` (task requires bcrypt-hashed passwords, no existing bcrypt/argon2 dependency)

2. **Create `src/models/user.ts`** — User interface with `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`; bcrypt hashing via `hashPassword()`/`verifyPassword()`; email validation

3. **Create `src/models/user.test.ts`** — Unit tests for email/password validation, password hashing/verification, input validation

4. **Run `pnpm test:int`** to verify

**Key decisions:**
- Using bcrypt (not argon2) since it's more commonly used with Node.js
- Following existing `src/models/notification.ts` pattern for model structure
- Using `Validator<T>` pattern from `src/validation/validators.ts` for validation functions
- No `Result<T, E>` usage in the model itself since the model is stateless — validation functions return error objects directly (matching the existing `validateEmail`/`validatePassword` pattern)
