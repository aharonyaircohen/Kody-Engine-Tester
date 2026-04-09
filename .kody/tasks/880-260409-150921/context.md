
### taskify (2026-04-09T15:12:14)
Created `src/utils/bad-types.ts` with `getCount(): string` that returns `42` — this will fail typecheck as intended.


### build (2026-04-09T15:12:53)
**Verified**: `src/utils/bad-types.ts` exists with the correct implementation:

```typescript
export function getCount(): string {
  return 42;  // Type error: number not assignable to string
}
```

TypeScript correctly reports:
```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

The implementation is complete and fails typecheck as intended.

