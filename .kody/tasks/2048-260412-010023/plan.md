Based on my investigation, the fix has already been applied to the node_modules `cli.js`. The diff shows:
- Three fallbacks to `.kody/memory.md` added to `readProjectMemoryTiered`
- `git ls-files` output block added to `buildFullPromptTiered`

However, this fix is only in node_modules and will be lost on reinstall. The proper solution requires creating a pnpm patch. Here's the plan:

---

## Plan: Add .kody/memory.md and file tree to taskify stage

### Step 1: Create pnpm patch for persistent fix
**File:** `/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/.kody/patches/@kody-ade+engine@0.1.62.patch`
**Change:** Create a proper patch file that will be applied automatically on `pnpm install`
**Why:** The fix exists in node_modules but would be lost on reinstall - need persistent patch
**Verify:** `pnpm install` and verify patch is applied to `node_modules/.pnpm/@kody-ade+engine@0.1.62_zod@4.3.6/node_modules/@kody-ade/engine/dist/bin/cli.js`

### Step 2: Verify fix is correctly applied
**File:** `node_modules/.pnpm/@kody-ade+engine@0.1.62_zod@4.3.6/node_modules/@kody-ade/engine/dist/bin/cli.js`
**Change:** Confirm the following modifications exist:
- Line ~3912: First fallback to `.kody/memory.md` when `memoryDir` doesn't exist
- Line ~3924: Second fallback when no `.md` files in directory
- Line ~3944: Third fallback after filtering
- Line ~12189: `git ls-files` block in `buildFullPromptTiered`
**Why:** Ensure the node_modules modification matches the intended fix
**Verify:** `grep -n "memory.md\|git ls-files" <cli.js>` shows 4+ matches

### Step 3: Run taskify stage to verify end-to-end
**Command:** `kody-engine run --issue-number 2023 --from taskify`
**Why:** Execute the test strategy from the task description
**Verify:** Check logs show memory.md content and file tree in prompt

### Step 4: Verify prompt contains required elements
**File:** Engine logs / Claude Code logs
**Change:** Verify the prompt sent to LLM contains:
- `.kody/memory.md` content (e.g., "TypeScript strict mode", "conventional commits")
- File tree from `git ls-files`
- No raw `{{TASK_CONTEXT}}` placeholder
**Why:** Confirm acceptance criteria are met
**Verify:** `grep -E "TypeScript strict|conventional commits|git ls-files|{{TASK_CONTEXT}}" <log>`

---

## Existing Patterns Found

- **Standalone taskify pattern (cli.js lines 6368-6388)**: Reads `.kody/memory.md` with `fs.readFileSync`, limits to 2000 chars, uses `execSync("git ls-files")` with 150 line limit - this is the exact pattern the fix follows
- **readProjectMemoryTiered function (cli.js lines 3903-3953)**: Original function only read from `.kody/memory/` directory - fix adds three fallbacks to `.kody/memory.md`
- **buildFullPromptTiered function (cli.js lines 12132-12208)**: Original assembled memory + prompt + diary - fix appends file tree before token budget check

## Questions

None - the fix pattern is clear from the standalone command and the node_modules modification shows the exact approach to follow.
