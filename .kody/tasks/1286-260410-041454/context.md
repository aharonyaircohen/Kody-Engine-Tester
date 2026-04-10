
### taskify (2026-04-10T04:17:22)
Created `src/utils/bad-types.ts` with `getCount(): string { return 42 }` — this intentionally violates TypeScript's return type annotation (returns `number` but declares `string`), causing a typecheck failure as intended.


### build (2026-04-10T04:18:05)
The typecheck confirms the intentional error is working correctly:

```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

**Summary:**
- `src/utils/bad-types.ts` was created with `function getCount(): string { return 42 }`
- The function declares return type `string` but returns the number `42`
- TypeScript correctly catches this error: `Type 'number' is not assignable to type 'string'`

The task is complete. The file intentionally violates TypeScr
...(truncated)
