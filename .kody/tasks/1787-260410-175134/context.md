
### taskify (2026-04-10T18:04:38)
The task is already complete. The file `src/utils/bad-types.ts` exists with the exact required content and correctly fails typecheck with:

```
error TS2322: Type 'number' is not assignable to type 'string'.
```

This matches the task requirement: `function getCount(): string { return 42 }` - the function declares a `string` return type but returns `42` (a number), causing the type error.


### build (2026-04-10T18:05:12)
The task is already complete. The verification confirms:

1. **`src/utils/bad-types.ts`** exists with the exact content:
   ```typescript
   export function getCount(): string {
     return 42;
   }
   ```

2. **TypeScript correctly catches the type error:**
   ```
   src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
   ```

This is the intentional design — `getCount()` declares a return type of `string` but returns the number `42`, which correctly fail
...(truncated)
