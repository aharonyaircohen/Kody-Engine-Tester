# Verification Report
## Result: FAIL

## Errors
- [typecheck] .next/types/validator.ts(206,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/board/modal")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(242,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage.test")' but required in type 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(251,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/ErrorPage")' but required in type 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(260,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage.test")' but required in type 'PagesPageConfig'.
- [typecheck] .next/types/validator.ts(269,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage")' does not satisfy the constraint 'PagesPageConfig'.
- [typecheck]   Property 'default' is missing in type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/error/NotFoundPage")' but required in type 'PagesPageConfig'.
- [typecheck] src/app/(frontend)/instructor/courses/[id]/edit/page.tsx(14,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
- [typecheck] src/app/(frontend)/notes/[id]/page.tsx(12,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
- [typecheck] src/app/(frontend)/notes/edit/[id]/page.tsx(11,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
- [typecheck] src/pages/contacts/detail/page.tsx(12,14): error TS18047: 'searchParams' is possibly 'null'.
- [typecheck] src/pages/contacts/form/page.tsx(16,18): error TS18047: 'searchParams' is possibly 'null'.
- [test]  [32m✓[39m src/utils/error-reporter.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 8[2mms[22m[39m
- [test]  [32m✓[39m src/components/error-boundary.test.tsx [2m([22m[2m9 tests[22m[2m)[22m[32m 300[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/ErrorPage.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 127[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/NotFoundPage.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 122[2mms[22m[39m
- [test] [2m Test Files [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m116 passed[39m[22m[90m (117)[39m
- [test] [2m     Errors [22m [1m[31m1 error[39m[22m
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows default fallback UI with error message
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows custom fallback component when provided
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows custom render fallback when provided
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mpasses error info to fallbackRender (error, componentStack, timestamp)
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mcalls onError callback when an error is caught
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2m"Try again" reset[2m > [22m[2mshows "Try again" button in default fallback
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2m"Try again" reset[2m > [22m[2mclicking "Try again" resets error state and re-renders children
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] Error: Child render error
- [test]     at ThrowError [90m(/Users/aguy/projects/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] (node:8839) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 2)
- [test] (Use `node --trace-warnings ...` to show where the warning was created)
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Suites 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m
- [test] [41m[1m FAIL [22m[49m tests/int/api.int.spec.ts[2m > [22mAPI
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
- [test] Vitest caught 1 unhandled error during the test run.
- [test] This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m
- [test] [31m[1mSerialized Error:[22m[39m [90m{ data: null, isOperational: true, isPublic: false, status: 500 }[39m
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
- [lint]   26:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   39:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   78:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   85:10  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
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
- [lint]   136:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   157:63  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   174:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   175:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   205:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   218:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   235:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   242:22  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   243:25  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   244:24  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   245:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   246:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   258:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
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
- [lint] /Users/aguy/projects/Kody-Engine-Tester/src/components/error-boundary.test.tsx
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
- [lint]    9:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   17:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   23:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   36:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   38:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   44:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   53:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   58:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    38:3   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   131:9   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   135:14  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
- [lint]     5:3   warning  'getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]     6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]    56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
- [lint]   211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
- [lint]   384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint] /Users/aguy/projects/Kody-Engine-Tester/src/utils/error-reporter.ts
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
- [lint] ✖ 119 problems (13 errors, 106 warnings)
- [lint]   1 error and 11 warnings potentially fixable with the `--fix` option.
- [lint]  ELIFECYCLE  Command failed with exit code 1.

## Summary
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
- [test] This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
- [lint] ✖ 119 problems (13 errors, 106 warnings)

## Raw Output
### typecheck
```
.next/types/validator.ts(206,31): error TS2344: Type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/pages/board/modal")' does not satisfy the constraint 'PagesPageConfig'.
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

```
### test
```
 PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 2)
(Use `node --trace-warnings ...` to show where the warning was created)

[31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Suites 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m tests/int/api.int.spec.ts[2m > [22mAPI
[31m[1mInvalidFieldRelationship[22m: Field Module has invalid relationship 'modules'.[39m
[90m [2m❯[22m node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/fields/config/sanitize.js:[2m93:31[22m[39m
[90m [2m❯[22m sanitizeFields node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/fields/config/sanitize.js:[2m91:31[22m[39m
[90m [2m❯[22m sanitizeCollection node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/collections/config/sanitize.js:[2m37:30[22m[39m
[90m [2m❯[22m sanitizeConfig node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/config/sanitize.js:[2m216:39[22m[39m
[90m [2m❯[22m buildConfig node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/config/build.js:[2m12:16[22m[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯[22m[39m

[31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
[31m[1m
Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m

[31m⎯⎯⎯⎯[39m[1m[41m Unhandled Rejection [49m[22m[31m⎯⎯⎯⎯⎯[39m
[31m[1mInvalidFieldRelationship[22m: Field Module has invalid relationship 'modules'.[39m
[90m [2m❯[22m node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/fields/config/sanitize.js:[2m93:31[22m[39m
[90m [2m❯[22m sanitizeFields node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/fields/config/sanitize.js:[2m91:31[22m[39m
[90m [2m❯[22m sanitizeCollection node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/collections/config/sanitize.js:[2m37:30[22m[39m
[90m [2m❯[22m sanitizeConfig node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/config/sanitize.js:[2m216:39[22m[39m
[90m [2m❯[22m processTicksAndRejections node:internal/process/task_queues:[2m103:5[22m[39m
[90m [2m❯[22m buildConfig node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/config/build.js:[2m12:16[22m[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22m[39m
[31m[1mSerialized Error:[22m[39m [90m{ data: null, isOperational: true, isPublic: false, status: 500 }[39m
[31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
[31m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39m


```
### lint
```
  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
  135:14  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any

/Users/aguy/projects/Kody-Engine-Tester/src/services/quiz-grader.test.ts
    5:3   warning  'getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
    6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
   56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/Users/aguy/projects/Kody-Engine-Tester/src/utils/error-reporter.ts
  22:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')

/Users/aguy/projects/Kody-Engine-Tester/src/utils/logger/index.ts
  80:7  error  'context' is never reassigned. Use 'const' instead  prefer-const

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

/Users/aguy/projects/Kody-Engine-Tester/src/utils/zip.test.ts
  54:11  warning  'c' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 119 problems (13 errors, 106 warnings)
  1 error and 11 warnings potentially fixable with the `--fix` option.

 ELIFECYCLE  Command failed with exit code 1.

```
