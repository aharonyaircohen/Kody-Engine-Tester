## Plan

### Step 1: Create `src/lib/` directory and `utils.ts`

**File:** `src/lib/utils.ts`
**Change:** Create new file with debounce function using the exact signature from the task: `<T extends (...args: unknown[]) => void>(fn: T, ms: number): T`
**Why:** The task specifies this exact location and type signature
**Verify:** `ls -la src/lib/` shows the file exists

### Step 2: Create unit test file

**File:** `src/lib/utils.test.ts`
**Change:** Create test file using fake timers (vi.useFakeTimers)
**Why:** Task requires unit test with fake timers
**Verify:** `pnpm test:int -- --run src/lib/utils.test.ts` passes

---

## Questions

- The task asks for `(...args: unknown[]) => void` type which loses type safety on arguments/return. The existing `src/utils/debounce.ts` uses `(...args: Parameters<T>) => ReturnType<T>` which preserves types. Should I use the less-type-safe signature as written in the task, or the more type-safe version that matches the existing implementation?
