
### taskify (2026-04-09T17:13:33)
Created `src/utils/bad-types.ts` with `getCount(): string { return 42 }` — this will fail typecheck since `42` is a `number`, not a `string`.


### build (2026-04-09T17:14:08)
The typecheck correctly catches the error in `src/utils/bad-types.ts`:

```
src/utils/bad-types.ts(1,31): error TS2322: Type 'number' is not assignable to type 'string'.
```

**Task status**: Complete. The file `src/utils/bad-types.ts` already exists with the intentionally wrong return type (`getCount(): string { return 42 }`), which correctly triggers the TypeScript typecheck failure.

