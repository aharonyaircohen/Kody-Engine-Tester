# Verification Report
## Result: FAIL

## Errors
- [test]  [31m❯[39m src/collections/Lessons.test.ts [2m([22m[2m21 tests[22m[2m | [22m[31m21 failed[39m[2m)[22m[32m 37[2mms[22m[39m
- [test]  [32m✓[39m src/components/error-boundary.test.tsx [2m([22m[2m9 tests[22m[2m)[22m[33m 890[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/ErrorPage.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[33m 977[2mms[22m[39m
- [test]      [33m[2m✓[22m[39m renders generic error heading [33m 846[2mms[22m[39m
- [test]  [32m✓[39m src/pages/error/NotFoundPage.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[33m 513[2mms[22m[39m
- [test]  [32m✓[39m src/utils/error-reporter.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 82[2mms[22m[39m
- [test] [2m Test Files [22m [1m[31m2 failed[39m[22m[2m | [22m[1m[32m106 passed[39m[22m[90m (108)[39m
- [test] [2m      Tests [22m [1m[31m21 failed[39m[22m[2m | [22m[1m[32m1430 passed[39m[22m[2m | [22m[33m1 skipped[39m[90m (1452)[39m
- [test] [2m     Errors [22m [1m[31m1 error[39m[22m
- [test]  ELIFECYCLE  Command failed with exit code 1.
- [test] (node:457941) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 2)
- [test] (Use `node --trace-warnings ...` to show where the warning was created)
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows default fallback UI with error message
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows custom fallback component when provided
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mshows custom render fallback when provided
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mpasses error info to fallbackRender (error, componentStack, timestamp)
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2mcatches errors and shows fallback[2m > [22m[2mcalls onError callback when an error is caught
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2m"Try again" reset[2m > [22m[2mshows "Try again" button in default fallback
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] [90mstderr[2m | src/components/error-boundary.test.tsx[2m > [22m[2mErrorBoundary[2m > [22m[2m"Try again" reset[2m > [22m[2mclicking "Try again" resets error state and re-renders children
- [test] [22m[39mError: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
- [test]   [message]: [32m'Child render error'[39m
- [test] The above error occurred in the <ThrowError> component.
- [test] React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
- [test] Error: Child render error
- [test]     at ThrowError [90m(/root/Kody-Engine-Tester/[39msrc/components/error-boundary.test.tsx:9:11[90m)[39m
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

## Summary
- [test] [31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Unhandled Errors [49m[22m[31m⎯⎯⎯⎯⎯⎯[39m
- [test] This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.[22m[39m
- [test] [31mThis error originated in "[1mtests/int/api.int.spec.ts[22m" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.[39m
- [lint] /root/Kody-Engine-Tester/tests/int/student-journey.test.ts
- [lint] ✖ 47 problems (0 errors, 47 warnings)

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
