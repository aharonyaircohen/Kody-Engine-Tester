# Test: verify amber banner with kody:paused label

Create a simple hello world function in src/utils/greeting.ts that returns 'Hello, World!'. Include a test file.

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody full --complexity high

## Questions for Kody:
1. Should the greeting function be synchronous or asynchronous?
2. Should it support custom greetings like 'Hello, {name}!'?

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1837-260410-214746` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24265688017))

To rerun: `@kody rerun 1837-260410-214746 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🛑 **Risk gate: HIGH complexity — awaiting approval**

<details><summary>📋 Plan summary</summary>

## Implementation Plan

**Step 1: Create test file first (TDD)**
**File:** `src/utils/greeting.test.ts`
**Change:** Create test file following `sum.test.ts` pattern
**Why:** TDD ordering - tests before implementation
**Verify:** `pnpm test:int src/utils/greeting.test.ts`

```typescript
import { describe, expect, it } from 'vitest'

import greeting from './greeting'

describe('greeting', () => {
  it('returns Hello, World!', () => {
    expect(greeting()).toBe('Hello, World!')
  })
})
```

**Step 2: Create implementation**
**File:** `src/utils/greeting.ts`
**Change:** Create function following `sum.ts` pattern
**Why:** Match existing convention for utility functions
**Verify:** `pnpm test:int src/utils/greeting.test.ts`

```typescript
export default function greeting(): string {
  return 'Hello, World!'
}
```

## Existing Patterns Found
- `src/utils/sum.ts` and `src/utils/sum.test.ts` — single default-exported function with vitest tests using describe/it/expect; reused for both greeting.ts and greeting.test.ts

</details>

To approve: `@kody approve`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24265785376))

To rerun: `@kody rerun approve` --from <stage>`

