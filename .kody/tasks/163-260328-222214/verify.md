# Verification Report
## Result: FAIL

## Errors
- [lint]   24:7  error  Error: Calling setState synchronously within an effect can trigger cascading renders
- [lint]   88:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   95:10  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
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
- [lint]   8:3  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
- [lint]   40:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
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
- [lint]   6:3  warning  'QuizAttemptRecord' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   7:3  warning  'SubmissionRecord' is defined but never used. Allowed unused vars must match /^_/u   @typescript-eslint/no-unused-vars
- [lint]    1:44  warning  'vi' is defined but never used. Allowed unused vars must match /^_/u           @typescript-eslint/no-unused-vars
- [lint]   83:13  warning  't3' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   40:11  warning  'postsById' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
- [lint]   93:13  warning  'parentDepth' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint] ✖ 44 problems (7 errors, 37 warnings)
- [lint]   0 errors and 6 warnings potentially fixable with the `--fix` option.
- [lint]  ELIFECYCLE  Command failed with exit code 1.

## Summary
- [lint] ✖ 44 problems (7 errors, 37 warnings)
- [lint] 0 errors and 6 warnings potentially fixable with the `--fix` option.

## Raw Output
### lint
```
tions(notificationsStore.getAll())
     |     ^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  32 |   }, [refreshKey])
  33 |
  34 |   const filtered = activeFilter === 'all'  react-hooks/set-state-in-effect

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/security/csrf-token.test.ts
  36:13  warning  't2' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/security/sanitizers.ts
  139:1  warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/security/validation-middleware.ts
   4:1   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
   6:26  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
   7:45  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
  17:1   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
  20:27  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
  21:28  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any
  22:29  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/analytics.test.ts
  6:3  warning  'QuizAttemptRecord' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  7:3  warning  'SubmissionRecord' is defined but never used. Allowed unused vars must match /^_/u   @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/discussions.test.ts
   1:44  warning  'vi' is defined but never used. Allowed unused vars must match /^_/u           @typescript-eslint/no-unused-vars
  83:13  warning  't3' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/discussions.ts
  40:11  warning  'postsById' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
  93:13  warning  'parentDepth' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 44 problems (7 errors, 37 warnings)
  0 errors and 6 warnings potentially fixable with the `--fix` option.

 ELIFECYCLE  Command failed with exit code 1.

```
