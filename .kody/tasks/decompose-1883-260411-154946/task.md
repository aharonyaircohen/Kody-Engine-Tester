# [] T26: Decompose: --no-compose flag

## Task
Test that --no-compose stops after parallel builds:
- Same complex task as T25
- Comment @kody decompose --no-compose

## Verification
- Parallel builds complete
- decompose-state.json saved with subPipelines
- NO merge/verify/review/ship phases
- No PR created
- Sub-task branches exist on remote

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody decompose --no-compose

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `decompose-1883-260411-154946` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285979293))

To rerun: `@kody rerun decompose-1883-260411-154946 --from <stage>`

