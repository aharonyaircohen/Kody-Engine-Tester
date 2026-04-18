# Plan: P3T15 - Verify bare @kody uses issue title as PR title

## Context
This is a verification task for the Kody Engine test suite. Issue #2507 asks to verify that when `@kody` is run (bare command without explicit `--issue-number`), the PR title correctly uses the issue title from `task.md` rather than a hardcoded value.

The Kody Engine's ship stage (cli.js lines 15837-15861) derives PR title from:
```javascript
title = `${prefix}: ${heading.replace(/^#\s*/, "").trim()}`.slice(0, 72);
```
Where `heading` comes from `task.md` first line (`# [issue title]`).

The task is in `build` stage. Build agent made changes but hasn't committed/pushed yet.

## Implementation Steps

### Step 1: Commit and Push Changes
```bash
cd /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester
git add -A
git commit -m "chore: add kody task artifacts [skip ci]"
git push origin 2507--run-20260418-0344-p3t15-pr-title-from-issue-t
```

### Step 2: Trigger Ship Stage (automatic via Kody Engine)
After push, ship stage creates PR with title derived from `task.md` heading.

### Step 3: Verify PR Title
Check the created PR title matches issue title:
- Issue title (from task.md): `[run-20260418-0344] P3T15: PR title from issue title`
- Expected PR title: `chore: [run-20260418-0344] P3T15: PR title from issue title`
- Verify via: `gh pr view <pr_number> --repo aharonyaircohen/Kody-Engine-Tester`

### Step 4: Document Results
Write verification to `verify.md` confirming PR title derivation.

## Critical Files
- `task.md` line 1: `# [run-20260418-0344] P3T15: PR title from issue title`
- Kody Engine PR title logic: `node_modules/.pnpm/@kody-ade+engine@0.4.0_zod@4.3.6/node_modules/@kody-ade/engine/dist/bin/cli.js:15837-15861`

## Verification Criteria
- [ ] Build stage commits and pushes changes
- [ ] Ship stage creates PR
- [ ] PR title = `chore: [run-20260418-0344] P3T15: PR title from issue title`
- [ ] Title is derived from task.md (issue title), not hardcoded
