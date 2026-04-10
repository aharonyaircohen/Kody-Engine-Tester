# [run-20260410-1200] T26: Decompose with --no-compose flag

## Test Case T26: Decompose with --no-compose flag\n\n**Command:** `@kody full` with subsequent decompose without compose\n\n**Purpose:** Verify that decompose works with --no-compose to avoid auto-composing subtasks.\n\n**Test Method:**\n1. Create a temp issue with a moderately complex task\n2. Trigger `@kody full`\n3. If Kody offers to decompose, use `@kody decompose --no-compose`\n4. Verify subtasks are not auto-composed\n5. Cleanup\n\n**Success Criteria:** Decompose respects --no-compose flag\n\n**Labels:** test-suite-temp, test-phase-1\n\n**Complexity:** medium

---

## Discussion (6 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1600-260410-121332` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24242330538))

To rerun: `@kody rerun 1600-260410-121332 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. The task.md says to use '@kody full' first then '@kody decompose --no-compose', but agent.md T26 (line 461) and kody-test-suite.md step 3.3 say to use '@kody decompose --no-compose' directly. Which is correct?
2. The pipeline is currently running taskify stage (started 2026-04-10T12:15:50Z). Should the test continue as-is or should it be restarted with the correct command?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

1. Use '@kody full' first on the temp issue, then '@kody decompose --no-compose' if Kody offers to decompose. The test is verifying that decompose respects --no-compose.
2. The test should continue as-is - the current pipeline with taskify stage running is fine. The test method involves running @kody full first, then decompose --no-compose if offered.

**@aharonyaircohen** (2026-04-10):
@kody approve

1. Use @kody full first on the temp issue, then @kody decompose --no-compose if Kody offers to decompose. The test is verifying that decompose respects --no-compose.
2. Continue as-is — the pipeline is already running the correct command (@kody full). Let it finish, then verify the --no-compose flag behavior.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1600-260410-121332` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24242739777))

To rerun: `@kody rerun 1600-260410-121332 --from <stage>`

