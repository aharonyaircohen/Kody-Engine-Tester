
### taskify (2026-04-11T16:29:38)
{
  "task_type": "feature",
  "title": "Add bcrypt password utilities",
  "description": "Add hashPassword and verifyPassword utilities using bcryptjs with 12 salt rounds at src/auth/password.ts. These standalone utilities provide bcrypt-based password hashing for future auth migration, without modifying existing UserStore (SHA-256) or AuthService (PBKDF2).",
  "scope": ["src/auth/password.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/auth/auth-service.ts:45-60 - verifyPassword 
...(truncated)

### build (2026-04-11T16:31:34)
## Implementation Complete

I've created `src/auth/password.ts` with bcrypt-based password utilities as specified in the task:

**File created:** `src/auth/password.ts`
- `hashPassword(plaintext: string): Promise<string>` - Uses bcryptjs with 12 salt rounds
- `verifyPassword(plaintext: string, hash: string): Promise<boolean>` - Verifies password using bcrypt.compare()

**Dependencies added to `package.json`:**
- `bcryptjs@^3.0.2` in dependencies
- `@types/bcryptjs@^2.4.6` in devDependencies

The
...(truncated)
