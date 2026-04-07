# [run-20260407-1802] T27: Decompose config disabled

## Task
Test decompose falls back when disabled in config.

## Setup
Add decompose.enabled: false to kody.config.json

## Command
@kody decompose on this issue

## Expected
- Logs show "decompose disabled in config — falling back"
- No decompose.json created
- Normal pipeline runs

## Cleanup
Revert the config change after test.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody decompose

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `decompose-585-260407-182453` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097536430))

To rerun: `@kody rerun decompose-585-260407-182453 --from <stage>`

