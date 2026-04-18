# [run-20260418-0344] P1T19: Fix-CI auto-trigger

Verify fix-ci workflow job triggers when CI fails on a PR.

**Multi-step setup:**
Step 1 — Create breakable CI workflow on main (if not exists):
  gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.github/workflows/test-ci.yml --method PUT     --field message='ci: add test-ci for T19 [skip ci]'     --field content="$(echo 'name: Test CI\non: [pull_request]\njobs:\n  health:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo CI health check' | base64)"

Step 2 — After Kody creates PR from T01/T02, fetch and break CI:
  git fetch origin <pr-branch> && git checkout <pr-branch>
  cat >> .github/workflows/test-ci.yml << 'YAML'
      - run: exit 1  # intentionally break CI for T19 test
YAML
  git add .github/workflows/test-ci.yml
  git commit -m 'chore: break CI for T19 test [skip ci]'
  git push origin <pr-branch>

## Verification
1. workflow_run event fires fix-ci-trigger job
2. Loop guard passes (no prior fix-ci comment in 24h)
3. @kody fix-ci comment auto-posted on PR
4. Pipeline runs mode=fix-ci, fetches CI logs, rebuilds from build stage
5. Fix pushed to same PR
6. Loop guard verified: second @kody fix-ci NOT auto-posted within 24h

**Cleanup:** Revert the break-CI commit from the PR branch.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2474-260418-040103`

