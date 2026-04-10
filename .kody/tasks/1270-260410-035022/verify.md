# Verification Report
## Result: FAIL

## Errors
- [typecheck] .next/types/validator.ts(350,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/board/modal")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(386,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(395,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(404,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(413,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] src/utils/object-helpers.test.ts(15,23): error TS2345: Argument of type '{ b: { d: number; }; }' is not assignable to parameter of type 'Partial<{ a: number; b: { c: number; }; }>'.
- [typecheck] src/utils/object-helpers.test.ts(22,23): error TS2559: Type '{ b: { c: number; }; }' has no properties in common with type 'Partial<{ a: number; }>'.
- [typecheck] src/utils/object-helpers.test.ts(32,48): error TS2322: Type 'null' is not assignable to type 'number | undefined'.
- [typecheck] src/utils/object-helpers.test.ts(45,20): error TS2353: Object literal may only specify known properties, and 'd' does not exist in type '{ c: number; e: number; }'.
- [typecheck] src/utils/object-helpers.test.ts(53,24): error TS2353: Object literal may only specify known properties, and 'e' does not exist in type '{ d: number; }'.
- [typecheck] src/utils/object-helpers.test.ts(59,42): error TS2353: Object literal may only specify known properties, and 'b' does not exist in type 'Partial<{ a: number; }>'.
- [typecheck] src/utils/object-helpers.test.ts(101,21): error TS2353: Object literal may only specify known properties, and 'd' does not exist in type '{ c: number; }'.
- [typecheck] src/utils/object-helpers.test.ts(109,14): error TS2322: Type 'null' is not assignable to type 'number'.
- [typecheck] src/utils/object-helpers.test.ts(117,14): error TS2322: Type 'undefined' is not assignable to type 'number'.
- [typecheck] src/utils/object-helpers.test.ts(134,26): error TS2353: Object literal may only specify known properties, and 'f' does not exist in type '{ c: number; d: number; }'.
- [typecheck] src/utils/object-helpers.test.ts(134,36): error TS2322: Type '{ g: number; }' is not assignable to type 'number'.
- [typecheck] src/utils/object-helpers.test.ts(141,42): error TS2322: Type 'Date' is not assignable to type 'number'.
- [typecheck] src/utils/object-helpers.test.ts(148,42): error TS2322: Type 'RegExp' is not assignable to type 'number'.
- [typecheck] src/utils/object-helpers.test.ts(149,21): error TS2339: Property 'source' does not exist on type 'number'.
- [typecheck] src/utils/object-helpers.test.ts(150,21): error TS2339: Property 'flags' does not exist on type 'number'.
- [typecheck] src/utils/object-helpers.ts(40,9): error TS2322: Type 'T' is not assignable to type 'Record<string, unknown>'.
- [typecheck] src/utils/object-helpers.ts(47,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
- [typecheck] src/utils/object-helpers.ts(52,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
- [typecheck] src/utils/object-helpers.ts(52,44): error TS2345: Argument of type 'Partial<T>[keyof T] & Record<string, unknown>' is not assignable to parameter of type 'Partial<T[keyof T] & Record<string, unknown>>'.
- [typecheck] src/utils/object-helpers.ts(59,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
- [typecheck] src/utils/object-helpers.ts(61,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
- [typecheck] tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
- [lint]   26:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   40:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]    56:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]    72:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]   103:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]   125:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]   133:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]    93:16  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]    98:19  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   103:19  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   108:17  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   31:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   80:7  error  'context' is never reassigned. Use 'const' instead  prefer-const
- [lint] ✖ 154 problems (13 errors, 141 warnings)
- [lint]   1 error and 11 warnings potentially fixable with the `--fix` option.

## Summary
- [typecheck] tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
- [lint] ✖ 154 problems (13 errors, 141 warnings)

## Raw Output
### typecheck
```
ror TS2353: Object literal may only specify known properties, and 'e' does not exist in type '{ d: number; }'.
src/utils/object-helpers.test.ts(59,42): error TS2353: Object literal may only specify known properties, and 'b' does not exist in type 'Partial<{ a: number; }>'.
src/utils/object-helpers.test.ts(101,21): error TS2353: Object literal may only specify known properties, and 'd' does not exist in type '{ c: number; }'.
src/utils/object-helpers.test.ts(109,14): error TS2322: Type 'null' is not assignable to type 'number'.
src/utils/object-helpers.test.ts(117,14): error TS2322: Type 'undefined' is not assignable to type 'number'.
src/utils/object-helpers.test.ts(134,26): error TS2353: Object literal may only specify known properties, and 'f' does not exist in type '{ c: number; d: number; }'.
src/utils/object-helpers.test.ts(134,36): error TS2322: Type '{ g: number; }' is not assignable to type 'number'.
src/utils/object-helpers.test.ts(141,42): error TS2322: Type 'Date' is not assignable to type 'number'.
src/utils/object-helpers.test.ts(148,42): error TS2322: Type 'RegExp' is not assignable to type 'number'.
src/utils/object-helpers.test.ts(149,21): error TS2339: Property 'source' does not exist on type 'number'.
src/utils/object-helpers.test.ts(150,21): error TS2339: Property 'flags' does not exist on type 'number'.
src/utils/object-helpers.ts(40,9): error TS2322: Type 'T' is not assignable to type 'Record<string, unknown>'.
  Type 'object' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type '{}'.
src/utils/object-helpers.ts(47,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
src/utils/object-helpers.ts(52,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
src/utils/object-helpers.ts(52,44): error TS2345: Argument of type 'Partial<T>[keyof T] & Record<string, unknown>' is not assignable to parameter of type 'Partial<T[keyof T] & Record<string, unknown>>'.
src/utils/object-helpers.ts(59,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
src/utils/object-helpers.ts(61,7): error TS2536: Type 'keyof T' cannot be used to index type 'Record<string, unknown>'.
tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
  Types of property 'data' are incompatible.
    Type '{ email: string; password: string; }' is not assignable to type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection"> & Partial<Pick<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">>'.
      Type '{ email: string; password: string; }' is missing the following properties from type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">': firstName, lastName, role

```
### test
```
{ length: 95, severity: 'ERROR', code: '42P02', detail: undefined, hint: undefined, position: '175', internalPosition: undefined, internalQuery: undefined, where: undefined, schema: undefined, table: undefined, dataType: undefined, constraint: undefined, file: 'parse_expr.c', routine: 'transformParamRef' }[39m

[31m⎯⎯⎯⎯[39m[1m[41m Unhandled Rejection [49m[22m[31m⎯⎯⎯⎯⎯[39m
[31m[1mError[22m: Failed query: SELECT conname AS primary_key
            FROM   pg_constraint join pg_class on (pg_class.oid = conrelid)
            WHERE  contype = 'p' 
            AND    connamespace = $1::regnamespace  
            AND    pg_class.relname = $2;
params: [39m
[90m [2m❯[22m NodePgPreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/pg-core/session.js:[2m41:15[22m[39m
[90m [2m❯[22m processTicksAndRejections node:internal/process/task_queues:[2m103:5[22m[39m
[90m [2m❯[22m Object.query node_modules/.pnpm/drizzle-kit@0.31.7/node_modules/drizzle-kit/api.js:[2m166296:19[22m[39m
[90m [2m❯[22m node_modules/.pnpm/drizzle-kit@0.31.7/node_modules/drizzle-kit/api.js:[2m44742:46[22m[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22m[39m
[31m[1mSerialized Error:[22m[39m [90m{ query: 'SELECT conname AS primary_key\n            FROM   pg_constraint join pg_class on (pg_class.oid = conrelid)\n            WHERE  contype = \'p\' \n            AND    connamespace = $1::regnamespace  \n            AND    pg_class.relname = $2;', params: [] }[39m
[31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
[31m[1mCaused by: error[22m: there is no parameter $1[39m
[90m [2m❯[22m node_modules/.pnpm/pg-pool@3.13.0_pg@8.16.3/node_modules/pg-pool/index.js:[2m45:11[22m[39m
[90m [2m❯[22m processTicksAndRejections node:internal/process/task_queues:[2m103:5[22m[39m
[90m [2m❯[22m node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/node-postgres/session.js:[2m113:20[22m[39m
[90m [2m❯[22m NodePgPreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/pg-core/session.js:[2m39:16[22m[39m
[90m [2m❯[22m Object.query node_modules/.pnpm/drizzle-kit@0.31.7/node_modules/drizzle-kit/api.js:[2m166296:19[22m[39m
[90m [2m❯[22m node_modules/.pnpm/drizzle-kit@0.31.7/node_modules/drizzle-kit/api.js:[2m44742:46[22m[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22m[39m
[31m[1mSerialized Error:[22m[39m [90m{ length: 95, severity: 'ERROR', code: '42P02', detail: undefined, hint: undefined, position: '175', internalPosition: undefined, internalQuery: undefined, where: undefined, schema: undefined, table: undefined, dataType: undefined, constraint: undefined, file: 'parse_expr.c', routine: 'transformParamRef' }[39m
[31m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39m


```
### lint
```
t.ts
    5:3   warning  'getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
    6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
   56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/error-reporter.ts
  22:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/logger/index.ts
  80:7  error  'context' is never reassigned. Use 'const' instead  prefer-const

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/logger/logger.test.ts
  22:9  warning  'transport' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  25:9  warning  'entries' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/middleware.test.ts
  148:24  warning  'next' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/object-helpers.test.ts
  125:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/omit.test.ts
  57:5  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars')

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/result.test.ts
  2:42  warning  'Ok' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/retry-queue.test.ts
  211:9  warning  'statsWhileRetrying' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/sleep.test.ts
  67:9  warning  'resolve' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/zip.test.ts
  54:11  warning  'c' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 154 problems (13 errors, 141 warnings)
  1 error and 11 warnings potentially fixable with the `--fix` option.

 ELIFECYCLE  Command failed with exit code 1.

```
