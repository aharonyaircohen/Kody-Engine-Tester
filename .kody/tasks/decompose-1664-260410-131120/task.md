# [run-20260410-1307] T24: Decompose simple task fallback

## T24: Decompose simple task fallback test

Verify that @kody decompose on a simple task falls back to normal pipeline.

**Trigger:** @kody decompose on the issue body below

**Issue body:**
Add a string capitalize utility function in src/utils/capitalize-first.ts that capitalizes only the first letter of a string, with tests in capitalize-first.test.ts.

**Verification:**
- complexity_score < 4 OR not decomposable
- Falls back to normal pipeline via runPipeline()
- PR created normally via standard flow
- Logs show: "Delegating to normal pipeline" or similar

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody decompose

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `decompose-1664-260410-131120` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244597958))

To rerun: `@kody rerun decompose-1664-260410-131120 --from <stage>`

