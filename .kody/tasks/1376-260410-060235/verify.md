# Verification Report
## Result: FAIL

## Errors
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
- [lint] ✖ 153 problems (13 errors, 140 warnings)
- [lint]   1 error and 11 warnings potentially fixable with the `--fix` option.

## Summary
- [test] [41m[1m FAIL [22m[49m tests/int/api.int.spec.ts[2m > [22mAPI[2m > [22mfetches users
- [test] [36m [2m❯[22m tests/int/api.int.spec.ts:[2m15:19[22m[39m
- [test] [36m [2m❯[22m tests/int/api.int.spec.ts:[2m15:19[22m[39m
- [lint] ✖ 153 problems (13 errors, 140 warnings)

## Raw Output
### typecheck
```
src/app/(frontend)/instructor/courses/[id]/edit/page.tsx(14,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/[id]/page.tsx(12,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/edit/[id]/page.tsx(11,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/pages/contacts/detail/page.tsx(12,14): error TS18047: 'searchParams' is possibly 'null'.
src/pages/contacts/form/page.tsx(16,18): error TS18047: 'searchParams' is possibly 'null'.

```
### test
```
users_sessions" "users_sessions" where "users_sessions"."_parent_id" = "users"."id" order by "users_sessions"."_order" asc) "users_sessions") "users_sessions" on true order by "users"."created_at" desc limit $1
params: 10[39m
[90m [2m❯[22m NodePgPreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/pg-core/session.js:[2m41:15[22m[39m
[90m [2m❯[22m node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/node-postgres/session.js:[2m117:22[22m[39m
[90m [2m❯[22m find node_modules/.pnpm/@payloadcms+drizzle@3.80.0_@types+pg@8.10.2_payload@3.80.0_graphql@16.13.2_typescript@5.7.3__pg@8.16.3/node_modules/@payloadcms/drizzle/dist/find/findMany.js:[2m137:21[22m[39m
[90m [2m❯[22m findOperation node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/dist/collections/operations/find.js:[2m129:22[22m[39m
[36m [2m❯[22m tests/int/api.int.spec.ts:[2m15:19[22m[39m
    [90m 13| [39m
    [90m 14| [39m  [34mit[39m([32m'fetches users'[39m[33m,[39m [35masync[39m () [33m=>[39m {
    [90m 15| [39m    [35mconst[39m users [33m=[39m [35mawait[39m payload[33m.[39m[34mfind[39m({
    [90m   | [39m                  [31m^[39m
    [90m 16| [39m      collection[33m:[39m [32m'users'[39m[33m,[39m
    [90m 17| [39m    })

[31m[1mCaused by: error[22m: column users.first_name does not exist[39m
[90m [2m❯[22m node_modules/.pnpm/pg-pool@3.13.0_pg@8.16.3/node_modules/pg-pool/index.js:[2m45:11[22m[39m
[90m [2m❯[22m node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/node-postgres/session.js:[2m124:18[22m[39m
[90m [2m❯[22m NodePgPreparedQuery.queryWithCache node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/pg-core/session.js:[2m39:16[22m[39m
[90m [2m❯[22m node_modules/.pnpm/drizzle-orm@0.44.7_@types+pg@8.10.2_pg@8.16.3/node_modules/drizzle-orm/node-postgres/session.js:[2m117:22[22m[39m
[90m [2m❯[22m find node_modules/.pnpm/@payloadcms+drizzle@3.80.0_@types+pg@8.10.2_payload@3.80.0_graphql@16.13.2_typescript@5.7.3__pg@8.16.3/node_modules/@payloadcms/drizzle/dist/find/findMany.js:[2m137:21[22m[39m
[90m [2m❯[22m findOperation node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/dist/collections/operations/find.js:[2m129:22[22m[39m
[36m [2m❯[22m tests/int/api.int.spec.ts:[2m15:19[22m[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22m[39m
[31m[1mSerialized Error:[22m[39m [90m{ length: 114, severity: 'ERROR', code: '42703', detail: undefined, hint: undefined, position: '22', internalPosition: undefined, internalQuery: undefined, where: undefined, schema: undefined, table: undefined, dataType: undefined, constraint: undefined, file: 'parse_relation.c', routine: 'errorMissingColumn' }[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯[22m[39m


```
### lint
```
ype                                                               @typescript-eslint/no-explicit-any

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/quiz-grader.test.ts
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

✖ 153 problems (13 errors, 140 warnings)
  1 error and 11 warnings potentially fixable with the `--fix` option.

 ELIFECYCLE  Command failed with exit code 1.

```
