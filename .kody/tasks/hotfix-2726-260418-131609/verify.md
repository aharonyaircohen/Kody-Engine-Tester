# Verification Report
## Result: FAIL

## Errors (in changeset)
- [lint]   18:33  error  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render     react-hooks/rules-of-hooks
- [lint]   19:49  error  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render     react-hooks/rules-of-hooks
- [lint]   20:45  error  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render     react-hooks/rules-of-hooks
- [lint]   21:37  error  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render     react-hooks/rules-of-hooks
- [lint]   23:28  error  React Hook "useRef" is called conditionally. React Hooks must be called in the exact same order in every component render       react-hooks/rules-of-hooks
- [lint]   26:3   error  React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render    react-hooks/rules-of-hooks
- [lint]   37:28  error  React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks
- [lint]   15:18  error  React Hook "useRouter" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks
- [lint]   16:27  error  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
- [lint]   17:39  error  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
- [lint]   19:3   error  React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks
- [lint]   14:18  error  React Hook "useRouter" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks
- [lint]   15:27  error  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
- [lint]   17:3   error  React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks
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
- [lint] ✖ 172 problems (26 errors, 146 warnings)
- [lint]   1 error and 11 warnings potentially fixable with the `--fix` option.

## Summary
- [lint] ✖ 172 problems (26 errors, 146 warnings)

## Raw Output
### lint
```
getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
    6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
   56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/error-reporter.ts
  22:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/group-by.test.ts
  34:10  warning  'Address' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

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

✖ 172 problems (26 errors, 146 warnings)
  1 error and 11 warnings potentially fixable with the `--fix` option.

 ELIFECYCLE  Command failed with exit code 1.

```
