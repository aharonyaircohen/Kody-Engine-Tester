# feat: add truncate utility function

Add a truncate(str: string, maxLength: number): string utility to src/utils/string.ts that cuts off at maxLength and appends '...' if the string was truncated. Include unit tests.

---

## Discussion (3 comments)

**@aguyaharonyair** (2026-04-09):
Testing session FTS search + episode creation. Expected:
- After pipeline completes: `Episode created: ep_plan_XXX` in logs
- After pipeline: run `kody graph search . truncate` locally on the tester repo and verify the episode appears in results
- The FTS index (.kody/graph/sessions-index.json) should contain the episode

**@aguyaharonyair** (2026-04-09):
@kody run

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `run` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24196404413))

To rerun: `@kody rerun run --from <stage>`

