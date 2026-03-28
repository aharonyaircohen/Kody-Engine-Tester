# Verification Report
## Result: FAIL

## Errors
- [test]  [31m❯[39m src/collections/Lessons.test.ts [2m([22m[2m21 tests[22m[2m | [22m[31m21 failed[39m[2m)[22m[32m 17[2mms[22m[39m
- [test]  [32m✓[39m src/components/error-boundary.test.tsx [2m([22m[2m9 tests[22m[2m)[22m[33m 338[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/ErrorPage.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[33m 303[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/NotFoundPage.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 269[2mms[22m[39m
- [test]  [32m✓[39m src/utils/error-reporter.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 26[2mms[22m[39m
- [test] [2m Test Files [22m [1m[31m2 failed[39m[22m[2m | [22m[1m[32m98 passed[39m[22m[90m (100)[39m
- [test] [2m      Tests [22m [1m[31m21 failed[39m[22m[2m | [22m[1m[32m1345 passed[39m[22m[2m | [22m[33m1 skipped[39m[90m (1367)[39m
- [test] [2m     Errors [22m [1m[31m1 error[39m[22m
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > create > should create a lesson with all fields,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > create > should default optional fields,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > create > should throw if moduleId is missing,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > create > should throw if moduleId is undefined,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > create > should auto-assign order as max+1 per module when not provided,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > create > should use explicit order when provided,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > getAll > should return all lessons sorted by order asc,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > getAll > should return empty array when no lessons exist,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > getById > should return a lesson by id,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > getById > should return null for non-existent id,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > getByModule > should return lessons for a module sorted by order asc,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > getByModule > should return empty array for module with no lessons,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > update > should update partial fields,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > update > should update type and clear videoUrl when switching away from video,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > update > should set new updatedAt,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > update > should throw for non-existent id,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > update > should throw if moduleId is updated to empty string,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > delete > should delete an existing lesson and return true,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > delete > should return false for non-existent id,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > ordering logic > should maintain correct order across multiple modules,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test] ::error file=/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/collections/Lessons.test.ts,title=src/collections/Lessons.test.ts > LessonStore > ordering logic > should allow reordering a lesson by updating its order field,line=8,column=13::TypeError: __vite_ssr_import_1__.LessonStore is not a constructor%0A ❯ src/collections/Lessons.test.ts:8:13%0A%0A
- [test]  ELIFECYCLE  Command failed with exit code 1.
- [test] (node:6568) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 2)
- [test] (Use `node --trace-warnings ...` to show where the warning was created)
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
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 21 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mcreate[2m > [22mshould create a lesson with all fields
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mcreate[2m > [22mshould default optional fields
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mcreate[2m > [22mshould throw if moduleId is missing
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mcreate[2m > [22mshould throw if moduleId is undefined
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mcreate[2m > [22mshould auto-assign order as max+1 per module when not provided
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mcreate[2m > [22mshould use explicit order when provided
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mgetAll[2m > [22mshould return all lessons sorted by order asc
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mgetAll[2m > [22mshould return empty array when no lessons exist
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mgetById[2m > [22mshould return a lesson by id
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mgetById[2m > [22mshould return null for non-existent id
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mgetByModule[2m > [22mshould return lessons for a module sorted by order asc
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mgetByModule[2m > [22mshould return empty array for module with no lessons
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mupdate[2m > [22mshould update partial fields
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mupdate[2m > [22mshould update type and clear videoUrl when switching away from video
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mupdate[2m > [22mshould set new updatedAt
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mupdate[2m > [22mshould throw for non-existent id
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mupdate[2m > [22mshould throw if moduleId is updated to empty string
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mdelete[2m > [22mshould delete an existing lesson and return true
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mdelete[2m > [22mshould return false for non-existent id
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mordering logic[2m > [22mshould maintain correct order across multiple modules
- [test] [41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mordering logic[2m > [22mshould allow reordering a lesson by updating its order field
- [test] [31m[1mTypeError[22m: __vite_ssr_import_1__.LessonStore is not a constructor[39m
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
- [test] Vitest caught 1 unhandled error during the test run.
- [test] This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m
- [test] [31m[1mSerialized Error:[22m[39m [90m{ data: null, isOperational: true, isPublic: false, status: 500 }[39m
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
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
- [lint]   1:32  warning  'beforeEach' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
- [lint]   8:11  warning  'MockUser' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
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
- [lint] ✖ 55 problems (7 errors, 48 warnings)
- [lint]   0 errors and 9 warnings potentially fixable with the `--fix` option.
- [lint]  ELIFECYCLE  Command failed with exit code 1.

## Summary
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
- [test] This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
- [lint] ✖ 55 problems (7 errors, 48 warnings)
- [lint] 0 errors and 9 warnings potentially fixable with the `--fix` option.

## Raw Output
### test
```
istent id
[41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mupdate[2m > [22mshould throw if moduleId is updated to empty string
[41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mdelete[2m > [22mshould delete an existing lesson and return true
[41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mdelete[2m > [22mshould return false for non-existent id
[41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mordering logic[2m > [22mshould maintain correct order across multiple modules
[41m[1m FAIL [22m[49m src/collections/Lessons.test.ts[2m > [22mLessonStore[2m > [22mordering logic[2m > [22mshould allow reordering a lesson by updating its order field
[31m[1mTypeError[22m: __vite_ssr_import_1__.LessonStore is not a constructor[39m
[36m [2m❯[22m src/collections/Lessons.test.ts:[2m8:13[22m[39m
    [90m  6| [39m
    [90m  7| [39m  [34mbeforeEach[39m(() [33m=>[39m {
    [90m  8| [39m    store [33m=[39m [35mnew[39m [33mLessonStore[39m()
    [90m   | [39m            [31m^[39m
    [90m  9| [39m  })
    [90m 10| [39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/22]⎯[22m[39m

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


/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/analytics.test.ts
  6:3  warning  'QuizAttemptRecord' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  7:3  warning  'SubmissionRecord' is defined but never used. Allowed unused vars must match /^_/u   @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/discussions.test.ts
   1:44  warning  'vi' is defined but never used. Allowed unused vars must match /^_/u           @typescript-eslint/no-unused-vars
  83:13  warning  't3' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/discussions.ts
  40:11  warning  'postsById' is assigned a value but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
  93:13  warning  'parentDepth' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/grading.test.ts
  1:32  warning  'beforeEach' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  8:11  warning  'MockUser' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/progress.ts
   38:3   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
  131:9   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
  135:14  warning  Unexpected any. Specify a different type                                                               @typescript-eslint/no-explicit-any

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/services/quiz-grader.test.ts
    5:3   warning  'getAttempts' is defined but never used. Allowed unused vars must match /^_/u    @typescript-eslint/no-unused-vars
    6:3   warning  'resetAttempts' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
   56:30  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  211:80  warning  Unexpected any. Specify a different type                                         @typescript-eslint/no-explicit-any
  384:11  warning  'quiz' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/utils/error-reporter.ts
  22:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')

✖ 55 problems (7 errors, 48 warnings)
  0 errors and 9 warnings potentially fixable with the `--fix` option.

 ELIFECYCLE  Command failed with exit code 1.

```
