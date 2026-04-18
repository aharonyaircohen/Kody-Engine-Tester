# Plan: Add `passwordHash` field to Payload CMS User collection

## Context

The `Users` Payload collection currently uses `auth: true` (Payload's built-in auth), which stores credentials in `hash` and `salt` fields. The `AuthService` (`src/auth/auth-service.ts`) already reads these fields. The task is to replace `auth: true` with an explicit `passwordHash` field, add PBKDF2 `beforeChange`/`afterRead` hooks, expand roles to match the domain model, create a barrel export, and wire `AuthService` to the new field.

## Files to Modify

### 1. `src/collections/Users.ts`

**Changes:**
- Remove `auth: true` (Payload built-in auth)
- Add `passwordHash: { name: 'passwordHash', type: 'text', required: true, hidden: true }` field
- Add `beforeChange` hook on `passwordHash` that hashes new passwords using PBKDF2 (25000 iterations, sha256, 512-bit key) — same params as `AuthService.verifyPassword`
- Add `afterRead` hook on `passwordHash` that strips it from API responses (`delete doc.passwordHash`)
- Expand `role` select options from `['admin','editor','viewer']` → `['admin','editor','viewer','guest','student','instructor']` to match domain model
- Access control: `create: () => true` (public registration unchanged), `delete: ({ req: { user } }) => !!user && user.role === 'admin'` (unchanged)
- Remove the existing `auth`-derived fields (Payload will no longer generate `hash`/`salt`/`verified`/`resetPasswordToken`)

### 2. `src/collections/index.ts` (new file)

```typescript
export { Assignments } from './Assignments'
export { Certificates } from './certificates'
export { Courses } from './Courses'
export { Enrollments } from './Enrollments'
export { Lessons } from './Lessons'
export { Media } from './Media'
export { Modules } from './Modules'
export { Notifications } from './Notifications'
export { Notes } from './notes'
export { Quizzes } from './Quizzes'
export { QuizAttempts } from './QuizAttempts'
export { Submissions } from './Submissions'
export { Users } from './Users'
```

### 3. `src/payload.config.ts`

**Changes:**
- Add `import { Assignments, ... } from './collections'` → replace individual imports with barrel import
- Replace `import { Users } from './collections/Users'` with `import { Users } from './collections'`

### 4. `src/auth/auth-service.ts`

**Changes in `login()` method:**
- Replace `const hash = (user as any).hash as string` → `const hash = (user as any).passwordHash as string`
- Replace `const salt = (user as any).salt as string` → `const salt = (user as any).passwordSalt as string`
- (The salt is generated in the `beforeChange` hook alongside the hash)
- Add a `passwordSalt` field alongside `passwordHash` in the hook — both stored, salt needed for verification

### 5. `src/collections/Users.ts` — hook implementations

**`beforeChange` hook** (hash password on create/update):
```typescript
async ({ data, operation }) => {
  const password = data?.password as string | undefined
  if (!password) return // no-op if not setting password
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.pbkdf2(password, salt, 25000, 64, 'sha256', (err, derivedKey) => {
      if (err) { reject(err); return }
      data.passwordSalt = salt
      resolve(derivedKey.toString('hex'))
    })
  })
}
```

**`afterRead` hook** (strip from responses):
```typescript
({ doc }) => {
  delete (doc as Record<string, unknown>).passwordHash
  delete (doc as Record<string, unknown>).passwordSalt
}
```

### 6. `src/collections/Users.test.ts`

**New tests to add:**
- Test `beforeChange` hook: calling the hook directly produces a non-empty hex string different from the plaintext password
- Test `afterRead` hook: calling the hook strips `passwordHash` and `passwordSalt` from the doc object
- Test role options now include `'guest'`, `'student'`, `'instructor'`

### 7. `src/auth/auth-service.test.ts`

**Changes:**
- Update `mockUser` in tests to use `passwordHash` and `passwordSalt` instead of `hash`/`salt`
- `verifyPassword` function in test mocks uses `passwordHash` and `passwordSalt`

## Verification

1. `pnpm test:int` — run integration tests (Vitest), verify Users collection tests pass
2. `pnpm test:int --reporter=verbose -- src/auth/auth-service.test.ts` — verify AuthService tests pass
3. `pnpm tsc --noEmit` — zero TypeScript errors
4. Optional: `pnpm build` to verify full Payload config compiles
