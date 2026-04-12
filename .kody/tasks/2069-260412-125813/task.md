# [run-20260412-1223] T13: State bypass on rerun

Verify that @kody rerun bypasses the 'already completed' state lock.

First @kody (completes), then @kody rerun (should re-execute).

## Verification
Second pipeline should run (not blocked by 'already completed' message).

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-12):
@kody

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2069-260412-125813` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24307290553))

