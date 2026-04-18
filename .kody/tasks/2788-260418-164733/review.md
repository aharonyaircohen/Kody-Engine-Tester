

Now I have the complete picture. Let me compile the structured review.

---

## Verdict: FAIL

## Summary

A `passwordHash` text field was added to the Users Payload collection with PBKDF2 hashing via a new `password-hash.ts` utility. The previous review's Critical issue (backward-compatibility gap in `AuthService.login`) was correctly fixed. However, the Major issue — the `beforeChange` hook in `Users.ts` returns `undefined` when no password is provided, destroying the stored hash on any profile update — was not fixed. The `Users.test.ts` test at line 274 validates the broken behavior rather than the correct one.

---

## Findings

### Critical

None.

### Major

**`src/collections/Users.ts:161–169`** — The `beforeChange` hook returns `undefined` when `data.password` is absent. Since `access: { update: () => false }` only blocks direct API writes — not Payload-internal writes triggered by other field updates — Payload interprets `undefined` as "clear the field" and sets `passwordHash` to `null` whenever a user updates any other profile field (bio, email, etc.). After any profile edit, the user becomes unable to authenticate.

`src/collections/Users.test.ts:274–281` — The test "should set passwordHash to undefined when no password is provided" explicitly validates the broken behavior. The test will need updating once the hook is fixed.

Suggested fix — update the `beforeChange` hook to preserve the existing hash:
```typescript
beforeChange: [
  ({ data, originalDoc }) => {
    if (data?.password) {
      return generatePasswordHash(data.password)
    }
    // Preserve existing passwordHash when password is not being changed
    return (originalDoc as { passwordHash?: string }).passwordHash ?? undefined
  },
]
```

Also update the test at `Users.test.ts:274` to pass a mock `originalDoc` with an existing `passwordHash` and assert the hook returns that value rather than `undefined`.

---

### Minor

**`src/auth/auth-service.test.ts:166`** — `mockPayload.login.mockRejectedValue(new Error('Unauthorized'))` in the "throws 401 when payload.login fails for legacy user" test uses a bare `Error` instead of the mocked `AuthenticationError`. This works because the code catches all errors as credential failures, but using `AuthenticationError` is more precise.

---

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### Enum & Value Completeness
The task added no new enums or status strings. No action needed.

### Race Conditions & Concurrency
No changes to concurrency-sensitive code paths.

### LLM Output Trust Boundary
No LLM-generated values in the diff.

### Shell Injection
None.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects

**`src/collections/Users.ts:161–169`** — The `passwordHash` field `access.update: () => false` means the admin panel and API cannot directly write to it, but `beforeChange` hooks always run internally. When a user updates another field, the hook runs, sees no `data.password`, returns `undefined`, and Payload nullifies the field. This is the Major finding above.

### Test Gaps

- `Users.test.ts:274–281` — Test "should set passwordHash to undefined when no password is provided" was added in this diff and asserts the incorrect (breaking) behavior. After fixing the hook, update this test to:
  ```typescript
  it('should preserve existing passwordHash when no password is provided', () => {
    const field = findField('passwordHash') as any
    const hook = field.hooks.beforeChange[0]
    const existingHash = 'testsalt:testhash'
    const result = (hook as any)({
      data: { firstName: 'Jane', lastName: 'Doe' },
      originalDoc: { passwordHash: existingHash },
    })
    expect(result).toBe(existingHash)
  })
  ```
- `auth-service.test.ts` mocks `verifyPasswordHash` to always return `true`, so the real PBKDF2 cross-verification path is never exercised by the test suite.

### Dead Code & Consistency
No dead code or stale comments detected.

### Crypto & Entropy
**`src/utils/password-hash.ts:48`** — `let storedHashBuffer: Buffer` is assigned but never used (the variable is shadowed by the `try` block's `Buffer.from` call). This is the lint warning already flagged in `verify.md`. Minor, auto-fixable with `--fix`.

---

## Suppressions

- `src/utils/password-hash.ts:48` — `derivedHex` unused variable warning; suppressed (already flagged by verify step).
- Pre-existing `bad-types.ts` and `seedUser.ts` TypeScript errors; not flagged (unrelated files, unmodified).
- Pre-existing `tests/int/api.int.spec.ts` PostgreSQL migration failure; not flagged (unrelated to this diff, database not running in review environment).