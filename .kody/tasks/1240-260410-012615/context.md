
### plan (2026-04-10T01:35:12)
Typecheck fails as expected:
```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```


### build (2026-04-10T01:36:06)
The file `src/utils/bad-types.ts` is already created with the intentional wrong return type:

```typescript
export function getCount(): string {
  return 42
}
```

The typecheck correctly fails with:
```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

This matches the expected behavior described in the task - a file with a function that declares return type `string` but returns a `number` (42). The task is complete.


### review (2026-04-10T01:38:18)

## Verdict: PASS

## Summary

The file `src/utils/bad-types.ts` was created with the intentionally wrong return type as specified in the task. The function `getCount()` declares a `string` return type but returns the number `42`, which will cause a TypeScript typecheck failure. This is the expected behavior per the task description.

## Findings

### Critical

None.

### Major

None.

### Minor

`src/utils/bad-types.ts:2` — **Intentional type mismatch**: Function declares `string` return type b
...(truncated)

### review-fix (2026-04-10T01:39:02)
The task is complete:

- **File exists**: `src/utils/bad-types.ts` (51 bytes)
- **Intentional error present**: `src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.`
- **Review verdict**: PASS — no Critical or Major findings

The file was created with the intentional type mismatch (`getCount()` declares `string` return but returns `42`/number), which correctly triggers a TypeScript typecheck failure. This is the expected behavior per the task specification
...(truncated)
