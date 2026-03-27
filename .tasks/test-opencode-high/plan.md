## Plan

**Step 1: Create test file for EventBus**
**File:** `src/utils/event-bus.test.ts`
**Change:** Write comprehensive tests covering typed events with generics, on/off/emit/once methods, wildcard listeners, max listener warnings, and error event handling
**Why:** TDD approach - tests first
**Verify:** `pnpm test` (should show failing tests)

**Step 2: Create EventBus implementation**
**File:** `src/utils/event-bus.ts`
**Change:** Implement the EventBus class with:
- Generic event typing support
- `on(event, handler)` - subscribe
- `off(event, handler)` - unsubscribe  
- `emit(event, data?)` - publish
- `once(event, handler)` - subscribe for single execution
- Wildcard listeners using `*` pattern (e.g., `user:*` catches `user:created`, `user:updated`)
- Max listener warning (default 10)
- Error event handling via special `error` event
**Why:** Core requirement
**Verify:** `pnpm test` (should pass)

**Step 3: Verify with lint/typecheck**
**Verify:** `pnpm run lint` and `tsc --noEmit`

---

## Questions

- Should wildcard listeners be prefix-only (`user:*`) or suffix-only (`*:created`)? Recommended: prefix-only for clarity (e.g., `user:*` catches all user events).
