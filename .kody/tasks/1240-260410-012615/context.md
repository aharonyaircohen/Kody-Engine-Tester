
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

