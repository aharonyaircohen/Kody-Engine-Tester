# [run-20260410-0437] T27: Decompose: config disabled

## Task
Test that decompose.enabled: false in kody.config.json causes immediate fallback to normal pipeline.

## Setup Steps
1. First, temporarily add decompose.enabled: false to kody.config.json:
   - Read current kody.config.json
   - Add "decompose": { "enabled": false }
   - Push the change

2. Then create this temp issue and comment @kody decompose

## Test Steps
1. Setup: Temporarily disable decompose in config
2. Create temp issue with complex task
3. Comment @kody decompose
4. Verify: Logs show 'decompose disabled in config — falling back'
5. Verify: Normal pipeline executes
6. Cleanup: Revert the config change

## Expected
- Immediate fallback to normal pipeline
- No decompose attempt

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody decompose

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `decompose-1341-260410-050426` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227330301))

To rerun: `@kody rerun decompose-1341-260410-050426 --from <stage>`

