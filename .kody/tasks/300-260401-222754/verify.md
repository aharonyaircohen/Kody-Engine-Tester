# Verification Report
## Result: FAIL

## Errors
- [typecheck] src/contexts/auth-context.test.tsx(76,13): error TS18047: 'authCtxRef.value' is possibly 'null'.
- [typecheck] src/contexts/auth-context.test.tsx(110,13): error TS18047: 'authCtxRef2.value' is possibly 'null'.
- [typecheck] src/contexts/auth-context.test.tsx(114,13): error TS18047: 'authCtxRef2.value' is possibly 'null'.
- [typecheck] src/contexts/auth-context.test.tsx(145,13): error TS18047: 'authCtxRef3.value' is possibly 'null'.
- [typecheck] src/utils/event-emitter.ts(22,33): error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
- [typecheck] src/utils/event-emitter.ts(61,17): error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
- [typecheck] src/utils/pipe.test.ts(6,20): error TS2554: Expected 1-10 arguments, but got 0.
- [typecheck] src/utils/pipe.test.ts(6,20): error TS2571: Object is of type 'unknown'.
- [typecheck] tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
- [test]  [32m✓[39m src/components/error-boundary.test.tsx [2m([22m[2m9 tests[22m[2m)[22m[33m 412[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/ErrorPage.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[33m 363[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/NotFoundPage.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[33m 351[2mms[22m[39m
- [test]  [32m✓[39m src/utils/error-reporter.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 35[2mms[22m[39m
- [test] [2m Test Files [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m110 passed[39m[22m[90m (111)[39m
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/tests/int/api.int.spec.ts,title=tests/int/api.int.spec.ts > API,line=11,column=15::Error: Error: missing secret key. A secret key is needed to secure Payload.%0A ❯ BasePayload.init node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/index.js:310:19%0A ❯ getPayload node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/index.js:593:26%0A ❯ tests/int/a
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
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Suites 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m
- [test] [41m[1m FAIL [22m[49m tests/int/api.int.spec.ts[2m > [22mAPI
- [test] [31m[1mError[22m: Error: missing secret key. A secret key is needed to secure Payload.[39m
- [lint]   26:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   95:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   71:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   23:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   34:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   14:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   17:9   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   27:41  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   30:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    38:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    41:9   warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    56:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    59:31  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    70:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    98:36  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   109:10  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
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
- [lint]   69:11  warning  Unexpected any. Specify a different type                                                                                                                                                                                             @typescript-eslint/no-explicit-any
- [lint]   73:11  warning  Unexpected any. Specify a different type                                                                                                                                                                                             @typescript-eslint/no-explicit-any
- [lint]    93:16  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]    98:19  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   103:19  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   108:17  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
- [lint]   31:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   36:13  warning  't2' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]    6:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]    7:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   20:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   21:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]   22:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
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
- [lint]   135:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
- [lint]     5:3   warning  'getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]     6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]    56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
- [lint]   211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
- [lint]   384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   22:9  warning  'transport' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   25:9  warning  'entries' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]   148:24  warning  'next' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   2:42  warning  'Ok' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   211:9  warning  'statsWhileRetrying' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   67:9  warning  'resolve' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   54:11  warning  'c' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint] ✖ 81 problems (12 errors, 69 warnings)
- [lint]  ELIFECYCLE  Command failed with exit code 1.

## Summary
- [typecheck] tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mcalls onError callback when an error is caught
- [test] [41m[1m FAIL [22m[49m tests/int/api.int.spec.ts[2m > [22mAPI
- [test] [36m [2m❯[22m tests/int/api.int.spec.ts:[2m11:15[22m[39m
- [lint] ✖ 81 problems (12 errors, 69 warnings)

## Raw Output
### typecheck
```
src/contexts/auth-context.test.tsx(76,13): error TS18047: 'authCtxRef.value' is possibly 'null'.
src/contexts/auth-context.test.tsx(110,13): error TS18047: 'authCtxRef2.value' is possibly 'null'.
src/contexts/auth-context.test.tsx(114,13): error TS18047: 'authCtxRef2.value' is possibly 'null'.
src/contexts/auth-context.test.tsx(145,13): error TS18047: 'authCtxRef3.value' is possibly 'null'.
src/utils/event-emitter.ts(22,33): error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
src/utils/event-emitter.ts(61,17): error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
src/utils/pipe.test.ts(6,20): error TS2554: Expected 1-10 arguments, but got 0.
src/utils/pipe.test.ts(6,20): error TS2571: Object is of type 'unknown'.
tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
  Type '{ collection: "users"; data: { email: string; password: string; }; }' is not assignable to type '{ data: DraftDataFromCollectionSlug<"users">; draft: true; } & { collection: "users"; context?: RequestContext | undefined; depth?: number | undefined; ... 13 more ...; user?: any; } & Pick<...>'.
    Property 'draft' is missing in type '{ collection: "users"; data: { email: string; password: string; }; }' but required in type '{ data: DraftDataFromCollectionSlug<"users">; draft: true; }'.

```
### test
```
[24m/cjs/react-dom-client.development.js:7662:22[90m)[39m
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



[31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Suites 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m tests/int/api.int.spec.ts[2m > [22mAPI
[31m[1mError[22m: Error: missing secret key. A secret key is needed to secure Payload.[39m
[90m [2m❯[22m BasePayload.init node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/index.js:[2m310:19[22m[39m
[90m [2m❯[22m getPayload node_modules/.pnpm/payload@3.80.0_graphql@16.13.1_typescript@5.7.3/node_modules/payload/dist/index.js:[2m593:26[22m[39m
[36m [2m❯[22m tests/int/api.int.spec.ts:[2m11:15[22m[39m
    [90m  9| [39m  [34mbeforeAll[39m([35masync[39m () [33m=>[39m {
    [90m 10| [39m    [35mconst[39m payloadConfig [33m=[39m [35mawait[39m config
    [90m 11| [39m    payload [33m=[39m [35mawait[39m [34mgetPayload[39m({ config[33m:[39m payloadConfig })
    [90m   | [39m              [31m^[39m
    [90m 12| [39m  })
    [90m 13| [39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯[22m[39m


```
### lint
```
 Specify a different type  @typescript-eslint/no-explicit-any
  36:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  38:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  44:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  53:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  58:33  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/progress.ts
  135:14  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/quiz-grader.test.ts
    5:3   warning  'getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
    6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
   56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/logger/logger.test.ts
  22:9  warning  'transport' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  25:9  warning  'entries' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/middleware.test.ts
  148:24  warning  'next' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/result.test.ts
  2:42  warning  'Ok' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/retry-queue.test.ts
  211:9  warning  'statsWhileRetrying' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/sleep.test.ts
  67:9  warning  'resolve' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/zip.test.ts
  54:11  warning  'c' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 81 problems (12 errors, 69 warnings)

 ELIFECYCLE  Command failed with exit code 1.

```
