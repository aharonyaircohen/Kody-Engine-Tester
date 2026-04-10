
### taskify (2026-04-10T17:25:07)
The file `src/utils/bad-types.ts` already exists with the correct content:

```typescript
export function getCount(): string {
  return 42;
}
```

This is a type error by design — the function declares return type `string` but returns `42` (a number). This will fail TypeScript's typecheck.

```json
{
  "task_type": "chore",
  "title": "Verify existing implementation of bad-types.ts",
  "description": "File src/utils/bad-types.ts already exists with the correct content: a function getCount() that
...(truncated)

### build (2026-04-10T17:25:53)
The task is already complete:

**Status:**
- `src/utils/bad-types.ts` exists with the correct content
- The file is already committed to `main` (commit `299967b`)
- TypeScript type checking fails as intended: `Type 'number' is not assignable to type 'string'`

**File contents:**
```typescript
export function getCount(): string {
  return 42;
}
```

This intentionally has a type error - the function declares return type `string` but returns `42` (a number). The task required creating this file to
...(truncated)
