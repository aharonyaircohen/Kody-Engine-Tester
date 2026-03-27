## Verdict: PASS

## Summary
Created an EventBus class with typed events, on/off/emit/once methods, wildcard listeners (prefix pattern), max listener warnings, and error event handling. All 23 tests pass and lint/typecheck are clean.

## Findings

### Critical
None.

### Major
None.

### Minor
- **`src/utils/event-bus.ts:14`** - `TEventMap` generic type parameter is defined but not used for runtime type safety (TypeScript generics are erased at runtime). This is expected behavior and the type parameter still provides compile-time type checking for consumers.

- **`src/utils/event-bus.ts:170`** - In `handleError`, the `args` parameter shadows the outer `args` in `emit`. While correct here (error args are always `[data]`), the naming is slightly confusing.

### Notes
- Tests adequately cover all required features including edge cases (manual `off` for non-existent handlers, chaining, listener counting).
- The `once` + wildcard combination works correctly because `onceHandler` removes itself from `wildcardListeners` upon first execution, preventing duplicate invocations.
- Max listener warning triggers correctly on the 11th listener (when max is 10), not before.

## Review Checklist
- [x] Does the code match the plan? Yes - all features implemented
- [x] Are edge cases handled? Yes - off for non-existent handlers, empty emits, etc.
- [x] Are there security concerns? None
- [x] Are tests adequate? Yes - 23 tests covering all features
- [x] Is error handling proper? Yes - error event with fallback throw
- [x] Are there any hardcoded values that should be configurable? No - maxListeners is configurable via constructor
