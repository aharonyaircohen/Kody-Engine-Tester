
### taskify (2026-04-09T22:08:50)
Done. Created `src/utils/bad-types.ts` with `function getCount(): string { return 42 }` — the function returns `42` (number) but is typed to return `string`, which will fail TypeScript type checking.


### build (2026-04-09T22:09:26)
The file `src/utils/bad-types.ts` exists with the required content:

```typescript
function getCount(): string { return 42 }
```

TypeScript correctly reports the expected error:
```
src/utils/bad-types.ts(1,31): error TS2322: Type 'number' is not assignable to type 'string'.
```

The function returns `42` (a number) but is typed to return `string`, which fails type checking as intended. The task is complete.

