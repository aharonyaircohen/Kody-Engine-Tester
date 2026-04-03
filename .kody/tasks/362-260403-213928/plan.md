## Existing Patterns Found

- `src/utils/logger/index.ts` — exports `jsonFormatter`, `prettyFormatter`, `consoleTransport`, `fileTransport`, `createLogger` — these will be re-exported/reused in the new modules
- `src/utils/logger/logger.test.ts` — uses Vitest with `vi.spyOn`, `fs` mocks, `os.tmpdir()` for temp files; integration tests follow `tests/int/**/*.int.spec.ts` pattern
- `vitest.config.mts` — includes `tests/int/**/*.int.spec.ts` for integration test coverage

## Plan

### Step 1: Write tests for log-formatter
**File:** `src/utils/log-formatter.test.ts`
**Change:** Create Vitest test file covering JSON and text output modes
**Verify:** `pnpm vitest run src/utils/log-formatter.test.ts`

### Step 2: Create log-formatter module
**File:** `src/utils/log-formatter.ts`
**Change:** Export `jsonFormatter` and `textFormatter` (ANSI-stripped text output), re-export types from existing logger
**Verify:** `pnpm vitest run src/utils/log-formatter.test.ts` passes

### Step 3: Write tests for log-transport
**File:** `src/services/logTransport.test.ts`
**Change:** Create Vitest test file for console and file transports
**Verify:** `pnpm vitest run src/services/logTransport.test.ts`

### Step 4: Create log-transport module
**File:** `src/services/logTransport.ts`
**Change:** Export `consoleTransport` and `fileTransport` — re-export from existing logger, add `bufferedFileTransport` for batch writes
**Verify:** `pnpm vitest run src/services/logTransport.test.ts` passes

### Step 5: Write tests for log-rotation
**File:** `src/utils/log-rotation.test.ts`
**Change:** Create Vitest test file for size-based rotation
**Verify:** `pnpm vitest run src/utils/log-rotation.test.ts`

### Step 6: Create log-rotation module
**File:** `src/utils/log-rotation.ts`
**Change:** Create `RotatingFileTransport` that wraps a `LogTransport`, rotates when file exceeds maxSize bytes, keeps up to maxFiles backups
**Verify:** `pnpm vitest run src/utils/log-rotation.test.ts` passes

### Step 7: Write integration test for logging pipeline
**File:** `tests/int/logging.pipeline.int.spec.ts`
**Change:** Create integration test wiring formatter → transport → rotation end-to-end
**Verify:** `pnpm vitest run tests/int/logging.pipeline.int.spec.ts`

### Step 8: Type-check
**Change:** Run `tsc --noEmit`
**Verify:** No type errors

## Questions

- Should `textFormatter` strip ANSI color codes or keep them? (Recommend: strip by default for file output, keep for console)
