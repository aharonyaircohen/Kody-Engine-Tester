# [run-20260417-1832] P2T08: Resolve merge conflicts

Verify @kody resolve detects and resolves merge conflicts on a PR.

**Safe conflict creation (DO NOT modify default branch directly):**
1. Get a file the PR modified (from gh pr diff)
2. Get PR base branch: gh pr view <n> --json baseRefName
3. Create conflict on base branch:
   git fetch origin <base> && git checkout <base>
   # Edit the same lines as the PR changed
   git commit -m 'test: create conflict for T08' && git push origin <base>
4. gh issue comment <n> --body '@kody resolve'

**Mandatory cleanup:** Revert the conflict commit from base branch after test:
  git revert <conflict-commit-hash> --no-edit && git push origin <base>

Depends on: Any completed PR

## Verification
Pipeline detects conflict, merges base, resolves conflicts, verifies, pushes. Resolve comment confirms success.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2303-260417-184432`

