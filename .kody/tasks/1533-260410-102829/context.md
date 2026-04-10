
### taskify (2026-04-10T10:31:20)
Created `src/utils/bad-types.ts` with a function `getCount()` that declares return type `string` but returns `42`. This will fail typecheck as intended.


### build (2026-04-10T10:31:55)
**Verification complete.** The file `src/utils/bad-types.ts` exists with the correct implementation:

```typescript
export function getCount(): string {
  return 42;
}
```

This produces the expected type error:
```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

The function declares return type `string` but returns `42` (a number), which correctly fails typecheck as intended by the task. The implementation matches the task requirements.

