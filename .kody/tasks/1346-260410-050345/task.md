# [run-20260410-0437] T36: Engine-managed dev server lifecycle

## Task
Test that the engine starts/stops the dev server for UI tasks instead of leaving it to the agent.

## Precondition
devServer must be configured in kody.config.json (currently NOT configured - this test may fail)

## Task Description
Add a breadcrumb component in src/components/Breadcrumb.tsx.

## Test Steps
1. Verify devServer is configured (precondition)
2. Create this UI temp issue
3. Comment @kody
4. Verify: 'Starting dev server:' in logs
5. Verify: 'Dev server stopped' in logs
6. Verify: KODY_DEV_SERVER_READY env var set
7. Verify: Agent does NOT start its own dev server

## Expected
- Engine manages dev server lifecycle
- Env vars set correctly

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1346-260410-044558` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226836244))

To rerun: `@kody rerun 1346-260410-044558 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should the Breadcrumb component have a co-located test file following the dark-mode-toggle.test.tsx pattern?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1346-260410-050345` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227289361))

To rerun: `@kody rerun 1346-260410-050345 --from <stage>`

