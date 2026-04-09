# Verification Report
## Result: FAIL

## Errors
- [typecheck] .next/dev/types/validator.ts(350,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/board/modal")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] .next/dev/types/validator.ts(386,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' but required in type 'PagesPageConfig'.
- [typecheck] .next/dev/types/validator.ts(395,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage")' but required in type 'PagesPageConfig'.
- [typecheck] .next/dev/types/validator.ts(404,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' but required in type 'PagesPageConfig'.
- [typecheck] .next/dev/types/validator.ts(413,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage")' but required in type 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(350,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/board/modal")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(386,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' but required in type 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(395,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage")' but required in type 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(404,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' but required in type 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(413,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage")' but required in type 'PagesPageConfig'.
- [typecheck] src/app/(frontend)/instructor/courses/[id]/edit/page.tsx(14,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
- [typecheck] src/app/(frontend)/notes/[id]/page.tsx(12,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
- [typecheck] src/app/(frontend)/notes/edit/[id]/page.tsx(11,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
- [typecheck] src/pages/contacts/detail/page.tsx(12,14): error TS18047: 'searchParams' is possibly 'null'.
- [typecheck] src/pages/contacts/form/page.tsx(16,18): error TS18047: 'searchParams' is possibly 'null'.
- [typecheck] tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
- [typecheck] tests/int/api.int.spec.ts(20,21): error TS2554: Expected 1 arguments, but got 0.
- [typecheck] tests/int/api.int.spec.ts(24,33): error TS2339: Property 'find' does not exist on type 'Promise<BasePayload>'.
- [test]  [32m✓[39m src/components/error-boundary.test.tsx [2m([22m[2m9 tests[22m[2m)[22m[33m 320[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/NotFoundPage.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[33m 306[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/ErrorPage.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 275[2mms[22m[39m
- [test]  [31m❯[39m src/collections/contacts.test.ts [2m([22m[2m33 tests[22m[2m | [22m[31m1 failed[39m[2m)[22m[32m 74[2mms[22m[39m
- [test]  [32m✓[39m src/utils/error-reporter.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 50[2mms[22m[39m
- [test] [2m Test Files [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m126 passed[39m[22m[90m (127)[39m
- [test] [2m      Tests [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m1779 passed[39m[22m[90m (1780)[39m
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/contacts.test.ts,title=src/collections/contacts.test.ts > ContactStore > sort > should sort by createdAt,line=209,column=36::AssertionError: expected 'Olivia' to be 'Mia' // Object.is equality%0A%0AExpected: "Mia"%0AReceived: "Olivia"%0A%0A ❯ src/collections/contacts.test.ts:209:36%0A%0A
- [test]  ELIFECYCLE  Command failed with exit code 1.
- [test]  ELIFECYCLE  Test failed. See above for more details.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows default fallback UI with error message
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows custom fallback component when provided
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows custom render fallback when provided
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mpasses error info to fallbackRender (error, componentStack, timestamp)
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mcalls onError callback when an error is caught
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2m"Try again" reset[2m > [22m[2mshows "Try again" button in default fallback
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2m"Try again" reset[2m > [22m[2mclicking "Try again" resets error state and re-renders children
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] Error: Child render error
- [test]     at ThrowError [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m
- [test] [41m[1m FAIL [22m[49m src/collections/contacts.test.ts[2m > [22mContactStore[2m > [22msort[2m > [22mshould sort by createdAt
- [test] [31m[1mAssertionError[22m: expected 'Olivia' to be 'Mia' // Object.is equality[39m
- [lint]   25:50  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   34:60   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   44:57   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   62:93   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   79:103  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   87:82   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    44:18  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    45:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    46:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    47:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    48:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    49:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   113:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   114:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   115:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   116:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   117:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   118:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   25:50  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    37:50   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    58:114  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    67:103  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    72:108  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    77:96   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    82:108  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    87:106  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    92:106  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    99:111  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   104:73   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   125:114  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   65:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   26:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   39:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   78:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   85:10  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]   3:27  warning  'request' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]    31:7  warning  'user' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]    64:7  warning  'user' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   109:7  warning  'user' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   84:3   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   87:39  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]   9:7  warning  'user' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   32:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   43:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   26:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   29:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   39:43  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   42:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    56:32  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    59:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    74:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    77:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    88:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   116:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   127:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]     2:28  warning  'AuthResult' is defined but never used. Allowed unused vars must match /^_/u         @typescript-eslint/no-unused-vars
- [lint]    44:50  warning  Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
- [lint]   214:11  warning  'mockUser' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]    93:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    94:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    95:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    96:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    97:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   137:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   158:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   175:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   176:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   206:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   219:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   236:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   243:22  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   244:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   245:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   246:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   247:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   259:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   8:3  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   10:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   26:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   26:83  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   28:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   37:55  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   37:87  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   42:58  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   42:93  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   49:53  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   49:83  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   13:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   19:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   24:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   40:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]    56:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]    72:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]   103:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]   125:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint]   133:7  error  Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
- [lint] /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/components/error-boundary.test.tsx
- [lint]   1:36  warning  'beforeEach' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   1:32  warning  'vi' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   10:45  warning  React Hook React.useEffect has a missing dependency: 'onToast'. Either include it or remove the dependency array. If 'onToast' changes too often, find the parent component that defines it and wrap that definition in useCallback  react-hooks/exhaustive-deps
- [lint]   63:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   69:11  warning  Unexpected any. Specify a different type                                                                                                                                                                                             @typescript-eslint/no-explicit-any
- [lint]   73:11  warning  Unexpected any. Specify a different type                                                                                                                                                                                             @typescript-eslint/no-explicit-any
- [lint]    93:16  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]    98:19  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   103:19  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   108:17  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   4:15  warning  'RbacRole' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   7:8  warning  'ValidationError' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   31:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   36:13  warning  't2' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   139:1  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]    4:1   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]    6:26  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]    7:45  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]   17:1   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   20:27  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]   21:28  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]   22:29  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]    1:44  warning  'vi' is defined but never used. Allowed unused vars must match /^_/u           @typescript-eslint/no-unused-vars
- [lint]   83:13  warning  't3' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   40:11  warning  'postsById' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]   93:13  warning  'parentDepth' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   375:46  warning  'lessons' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   173:13  warning  'maxScore' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   1:32  warning  'beforeEach' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   8:11  warning  'MockUser' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]   6:20  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   10:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   18:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   24:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   37:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   39:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   45:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   54:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   59:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    38:3   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   131:9   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   135:14  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]     5:3   warning  'getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]     6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]    56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
- [lint]   211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
- [lint]   384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint] /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/error-reporter.ts
- [lint]   22:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- [lint]   80:7  error  'context' is never reassigned. Use 'const' instead  prefer-const
- [lint]   22:9  warning  'transport' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   25:9  warning  'entries' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]   148:24  warning  'next' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   57:5  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars')
- [lint]   2:42  warning  'Ok' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   211:9  warning  'statsWhileRetrying' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   67:9  warning  'resolve' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   54:11  warning  'c' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint] ✖ 153 problems (13 errors, 140 warnings)
- [lint]   1 error and 11 warnings potentially fixable with the `--fix` option.
- [lint]  ELIFECYCLE  Command failed with exit code 1.

## Summary
- [typecheck] tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
- [typecheck] tests/int/api.int.spec.ts(20,21): error TS2554: Expected 1 arguments, but got 0.
- [typecheck] tests/int/api.int.spec.ts(24,33): error TS2339: Property 'find' does not exist on type 'Promise<BasePayload>'.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mpasses error info to fallbackRender (error, componentStack, timestamp)
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mcalls onError callback when an error is caught
- [test] [31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m
- [lint] ✖ 153 problems (13 errors, 140 warnings)

## Raw Output
### typecheck
```
unner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' but required in type 'PagesPageConfig'.
.next/types/validator.ts(395,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/ErrorPage")' but required in type 'PagesPageConfig'.
.next/types/validator.ts(404,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' but required in type 'PagesPageConfig'.
.next/types/validator.ts(413,31): error TS2344: Type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage")' does not satisfy the constraint 'PagesPageConfig'.
  Property 'default' is missing in type 'typeof import("/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/pages/error/NotFoundPage")' but required in type 'PagesPageConfig'.
src/app/(frontend)/instructor/courses/[id]/edit/page.tsx(14,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/[id]/page.tsx(12,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/edit/[id]/page.tsx(11,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/pages/contacts/detail/page.tsx(12,14): error TS18047: 'searchParams' is possibly 'null'.
src/pages/contacts/form/page.tsx(16,18): error TS18047: 'searchParams' is possibly 'null'.
tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
  Types of property 'data' are incompatible.
    Type '{ email: string; password: string; }' is not assignable to type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection"> & Partial<Pick<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">>'.
      Type '{ email: string; password: string; }' is missing the following properties from type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">': firstName, lastName, role
tests/int/api.int.spec.ts(20,21): error TS2554: Expected 1 arguments, but got 0.
tests/int/api.int.spec.ts(24,33): error TS2339: Property 'find' does not exist on type 'Promise<BasePayload>'.

```
### test
```
t@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:7662:22[90m)[39m
    at updateFunctionComponent [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39mnode_modules/[4m.pnpm[24m/react-dom@19.2.4_react@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:10166:19[90m)[39m
    at beginWork [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39mnode_modules/[4m.pnpm[24m/react-dom@19.2.4_react@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:11778:18[90m)[39m
    at runWithFiberInDEV [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39mnode_modules/[4m.pnpm[24m/react-dom@19.2.4_react@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:874:13[90m)[39m
    at performUnitOfWork [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39mnode_modules/[4m.pnpm[24m/react-dom@19.2.4_react@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:17641:22[90m)[39m
    at workLoopSync [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39mnode_modules/[4m.pnpm[24m/react-dom@19.2.4_react@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:17469:41[90m)[39m
    at renderRootSync [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39mnode_modules/[4m.pnpm[24m/react-dom@19.2.4_react@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:17450:11[90m)[39m
    at performWorkOnRoot [90m(/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/[39mnode_modules/[4m.pnpm[24m/react-dom@19.2.4_react@19.2.4/node_modules/[4mreact-dom[24m/cjs/react-dom-client.development.js:16583:35[90m)[39m {
  [stack]: [36m[Getter/Setter][39m,
  [message]: [32m'Child render error'[39m
}

The above error occurred in the <ThrowError> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.



[31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m src/collections/contacts.test.ts[2m > [22mContactStore[2m > [22msort[2m > [22mshould sort by createdAt
[31m[1mAssertionError[22m: expected 'Olivia' to be 'Mia' // Object.is equality[39m

Expected: [32m"[7mM[27mia"[39m
Received: [31m"[7mOliv[27mia"[39m

[36m [2m❯[22m src/collections/contacts.test.ts:[2m209:36[22m[39m
    [90m207| [39m      [34mexpect[39m(results[[34m0[39m][33m.[39mfirstName)[33m.[39m[34mtoBe[39m([32m'Olivia'[39m)
    [90m208| [39m      [34mexpect[39m(results[[34m1[39m][33m.[39mfirstName)[33m.[39m[34mtoBe[39m([32m'Noah'[39m)
    [90m209| [39m      [34mexpect[39m(results[[34m2[39m][33m.[39mfirstName)[33m.[39m[34mtoBe[39m([32m'Mia'[39m)
    [90m   | [39m                                   [31m^[39m
    [90m210| [39m    })
    [90m211| [39m  })

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
