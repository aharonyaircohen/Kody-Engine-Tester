# Verification Report
## Result: FAIL

## Errors
- [test] [31m[1mAssertionError[22m: expected '1/15/2024, 12:30 PM' to contain '10'[39m
- [test] [31m[1mAssertionError[22m: expected '1/1/2100' to contain '2099'[39m
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
- [lint] ✖ 159 problems (12 errors, 147 warnings)
- [playwright]       "type": "Error",
- [playwright]           Error: connect ECONNREFUSED 127.0.0.1:5432
- [playwright]       "type": "Error",
- [playwright]           Error: connect ECONNREFUSED 127.0.0.1:5432
- [playwright]     Error: Error: cannot connect to Postgres: connect ECONNREFUSED 127.0.0.1:5432
- [playwright]     Error: Error: cannot connect to Postgres: connect ECONNREFUSED 127.0.0.1:5432
- [playwright]     Error: page.goto: net::ERR_ABORTED; maybe frame was detached?

## Summary
- [typecheck] tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
- [test] [31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 2 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
- [test] This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m
- [lint] ✖ 159 problems (12 errors, 147 warnings)
- [lint] 0 errors and 11 warnings potentially fixable with the `--fix` option.

## Raw Output
### typecheck
```
Tester/src/pages/board/modal")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/board/modal")' but required in type 'PagesPageConfig'.
.next/types/validator.ts(242,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' but required in type 'PagesPageConfig'.
.next/types/validator.ts(251,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage")' but required in type 'PagesPageConfig'.
.next/types/validator.ts(260,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' but required in type 'PagesPageConfig'.
.next/types/validator.ts(269,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage")' but required in type 'PagesPageConfig'.
src/app/(frontend)/instructor/courses/[id]/edit/page.tsx(14,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/[id]/page.tsx(12,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/edit/[id]/page.tsx(11,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/pages/contacts/detail/page.tsx(12,14): error TS18047: 'searchParams' is possibly 'null'.
src/pages/contacts/form/page.tsx(16,18): error TS18047: 'searchParams' is possibly 'null'.
tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
  Types of property 'data' are incompatible.
    Type '{ email: string; password: string; }' is not assignable to type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection"> & Partial<Pick<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">>'.
      Type '{ email: string; password: string; }' is missing the following properties from type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">': firstName, lastName, role

```
### test
```
3.2_typescript@5.7.3_/node_modules/@payloadcms/db-postgres/dist/connect.js:[2m105:15[22m[39m
[90m [2m❯[22m BasePayload.init node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/dist/index.js:[2m371:13[22m[39m
[90m [2m❯[22m getPayload node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/dist/index.js:[2m593:26[22m[39m
[36m [2m❯[22m tests/int/api.int.spec.ts:[2m11:15[22m[39m
    [90m  9| [39m  [34mbeforeAll[39m([35masync[39m () [33m=>[39m {
    [90m 10| [39m    [35mconst[39m payloadConfig [33m=[39m [35mawait[39m config
    [90m 11| [39m    payload [33m=[39m [35mawait[39m [34mgetPayload[39m({ config[33m:[39m payloadConfig })
    [90m   | [39m              [31m^[39m
    [90m 12| [39m  })
    [90m 13| [39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯[22m[39m


[31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 2 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m src/utils/format-date.test.ts[2m > [22mformatDate[2m > [22mlocale format[2m > [22mformats with time components
[31m[1mAssertionError[22m: expected '1/15/2024, 12:30 PM' to contain '10'[39m

Expected: [32m"1[7m0[27m"[39m
Received: [31m"1[7m/15/2024, 12:30 PM[27m"[39m

[36m [2m❯[22m src/utils/format-date.test.ts:[2m115:22[22m[39m
    [90m113| [39m      })
    [90m114| [39m      [34mexpect[39m(result)[33m.[39m[34mtoContain[39m([32m'2024'[39m)
    [90m115| [39m      [34mexpect[39m(result)[33m.[39m[34mtoContain[39m([32m'10'[39m)
    [90m   | [39m                     [31m^[39m
    [90m116| [39m    })
    [90m117| [39m  })

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯[22m[39m

[41m[1m FAIL [22m[49m src/utils/format-date.test.ts[2m > [22mformatDate[2m > [22medge cases[2m > [22mhandles far future date
[31m[1mAssertionError[22m: expected '1/1/2100' to contain '2099'[39m

Expected: [32m"2099"[39m
Received: [31m"1/1/2100"[39m

[36m [2m❯[22m src/utils/format-date.test.ts:[2m135:22[22m[39m
    [90m133| [39m      [35mconst[39m farFuture [33m=[39m [35mnew[39m [33mDate[39m([32m'2099-12-31T23:59:59Z'[39m)
    [90m134| [39m      [35mconst[39m result [33m=[39m [34mformatDate[39m(farFuture[33m,[39m { format[33m:[39m [32m'locale'[39m })
    [90m135| [39m      [34mexpect[39m(result)[33m.[39m[34mtoContain[39m([32m'2099'[39m)
    [90m   | [39m                     [31m^[39m
    [90m136| [39m    })
    [90m137| [39m  })

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯[22m[39m

[31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
[31m[1m
Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m

[31m⎯⎯⎯⎯[39m[1m[41m Unhandled Rejection [49m[22m[31m⎯⎯⎯⎯⎯[39m
{ type: 'Unhandled Rejection', message: undefined, stacks: [] }
[31m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39m


```
### lint
```
rning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/error-reporter.ts
  22:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')

/Users/aguy/projects/Kody-Engine-Tester/src/utils/logger/logger.test.ts
  22:9  warning  'transport' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  25:9  warning  'entries' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/middleware.test.ts
  148:24  warning  'next' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/omit.test.ts
  57:5  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars')

/Users/aguy/projects/Kody-Engine-Tester/src/utils/result.test.ts
  2:42  warning  'Ok' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/retry-queue.test.ts
  211:9  warning  'statsWhileRetrying' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/sleep.test.ts
  67:9  warning  'resolve' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/test-fts.test.ts
    1:32  warning  'beforeEach' is defined but never used. Allowed unused vars must match /^_/u                         @typescript-eslint/no-unused-vars
    2:51  warning  'mkdirSync' is defined but never used. Allowed unused vars must match /^_/u                          @typescript-eslint/no-unused-vars
   18:24  warning  'FtsIndex' is defined but never used. Allowed unused vars must match /^_/u                           @typescript-eslint/no-unused-vars
   23:7   warning  'TEST_SESSIONS_INDEX_PATH' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  270:13  warning  'episode' is assigned a value but never used. Allowed unused vars must match /^_/u                   @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/test-fts.ts
  3:25  warning  'FtsDocument' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/zip.test.ts
  54:11  warning  'c' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 159 problems (12 errors, 147 warnings)
  0 errors and 11 warnings potentially fixable with the `--fix` option.

 ELIFECYCLE  Command failed with exit code 1.

```
### playwright
```
bject.connect (/Users/aguy/projects/Kody-Engine-Tester/node_modules/.pnpm/@payloadcms+db-postgres@3.80.0_payload@3.80.0_graphql@16.13.2_typescript@5.7.3_/node_modules/@payloadcms/db-postgres/src/connect.ts:111:11)
        at BasePayload.init (/Users/aguy/projects/Kody-Engine-Tester/node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/src/index.ts:891:7)
        at getPayload (/Users/aguy/projects/Kody-Engine-Tester/node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/src/index.ts:1198:22)
        at seedTestUser (/Users/aguy/projects/Kody-Engine-Tester/tests/helpers/seedUser.ts:13:19)
        at /Users/aguy/projects/Kody-Engine-Tester/tests/e2e/admin.e2e.spec.ts:9:5

    undefined

    Error: Error: cannot connect to Postgres: connect ECONNREFUSED 127.0.0.1:5432

       at ../helpers/seedUser.ts:37

      35 |  */
      36 | export async function cleanupTestUser(): Promise<void> {
    > 37 |   const payload = await getPayload({ config })
         |                   ^
      38 |
      39 |   await payload.delete({
      40 |     collection: 'users',
        at Object.connect (/Users/aguy/projects/Kody-Engine-Tester/node_modules/.pnpm/@payloadcms+db-postgres@3.80.0_payload@3.80.0_graphql@16.13.2_typescript@5.7.3_/node_modules/@payloadcms/db-postgres/src/connect.ts:111:11)
        at BasePayload.init (/Users/aguy/projects/Kody-Engine-Tester/node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/src/index.ts:891:7)
        at getPayload (/Users/aguy/projects/Kody-Engine-Tester/node_modules/.pnpm/payload@3.80.0_graphql@16.13.2_typescript@5.7.3/node_modules/payload/src/index.ts:1198:22)
        at cleanupTestUser (/Users/aguy/projects/Kody-Engine-Tester/tests/helpers/seedUser.ts:37:19)
        at /Users/aguy/projects/Kody-Engine-Tester/tests/e2e/admin.e2e.spec.ts:18:5


[1A[2K[3/4] [chromium] › tests/e2e/admin.e2e.spec.ts:28:3 › Admin Panel › can navigate to list view
[1A[2K[4/4] [chromium] › tests/e2e/admin.e2e.spec.ts:35:3 › Admin Panel › can navigate to edit view
[1A[2K  2) [chromium] › tests/e2e/frontend.e2e.spec.ts:11:3 › Frontend › can go on homepage ──────────────

    [31mTest timeout of 30000ms exceeded.[39m

    Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
    Call log:
    [2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


      10 |
      11 |   test('can go on homepage', async ({ page }) => {
    > 12 |     await page.goto('http://localhost:3000')
         |                ^
      13 |
      14 |     await expect(page).toHaveTitle(/Payload Blank Template/)
      15 |
        at /Users/aguy/projects/Kody-Engine-Tester/tests/e2e/frontend.e2e.spec.ts:12:16


[1A[2K  2 failed
    [chromium] › tests/e2e/admin.e2e.spec.ts:21:3 › Admin Panel › can navigate to dashboard ────────
    [chromium] › tests/e2e/frontend.e2e.spec.ts:11:3 › Frontend › can go on homepage ───────────────
  2 did not run

```
