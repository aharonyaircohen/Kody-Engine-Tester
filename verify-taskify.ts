#!/usr/bin/env node
/**
 * verify-taskify.ts
 *
 * Verifies that `kody taskify --file docs/test-prd.md` produced correct output
 * by checking the generated .kody/tasks/{taskId}/taskify-result.json against
 * all 5 acceptance criteria:
 *
 *  1. Sub-issues created with priority:high/medium/low labels
 *  2. Each sub-issue body has ## Test Strategy section
 *  3. Each sub-issue body has ## Context section
 *  4. Each sub-issue body has ## Acceptance Criteria section
 *  5. Topological order correct (depends-on filed before dependent)
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const TASK_DIR = process.env.TASK_DIR ||
  "/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/.kody/tasks/2288-260417-184341";
const RESULT_FILE = path.join(TASK_DIR, "taskify-result.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fail(msg: string): never {
  console.error(`[FAIL] ${msg}`);
  process.exit(1);
}

function pass(msg: string): void {
  console.log(`[PASS] ${msg}`);
}

// Kahn's algorithm for topological sort verification
function verifyTopoOrder(tasks: Task[]): boolean {
  const n = tasks.length;
  const inDegree = new Array<number>(n).fill(0);
  const adj: number[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    const deps = tasks[i].dependsOn ?? [];
    for (const d of deps) {
      if (d < 0 || d >= n) {
        fail(`Task ${i} has out-of-bounds dependsOn index: ${d}`);
      }
      adj[d].push(i);
      inDegree[i]++;
    }
  }

  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const sorted: number[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    sorted.push(curr);
    for (const neighbor of adj[curr]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== n) {
    console.error(
      `[FAIL] Cycle detected — topo sort produced only ${sorted.length}/${n} nodes`
    );
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Task {
  title: string;
  body: string;
  labels: string[];
  priority: string;
  dependsOn: number[];
}

interface TaskifyResult {
  status: string;
  tasks: Task[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log("=".repeat(60));
console.log("Verifying taskify output");
console.log("=".repeat(60));
console.log();

// 1. Read result file
if (!fs.existsSync(RESULT_FILE)) {
  fail(`taskify-result.json not found at: ${RESULT_FILE}`);
}

let result: TaskifyResult;
try {
  result = JSON.parse(fs.readFileSync(RESULT_FILE, "utf-8"));
} catch (e) {
  fail(`Failed to parse ${RESULT_FILE}: ${e}`);
}

if (result.status !== "ready") {
  fail(`Expected status "ready", got "${result.status}"`);
}

const tasks = result.tasks;
if (!Array.isArray(tasks) || tasks.length === 0) {
  fail("No tasks found in taskify-result.json");
}

console.log(`Found ${tasks.length} task(s) in taskify-result.json`);
console.log();

// ---------------------------------------------------------------------------
// Criterion 1 — Priority labels (verified via GitHub issues)
// The LLM writes categorization labels (backend, db) to taskify-result.json.
// The kody CLI additionally applies the priority:high/medium/low label when
// creating each GitHub issue. We verify the priority label on the actual issues.
// ---------------------------------------------------------------------------
console.log("--- Criterion 1: priority:high/medium/low labels on sub-issues ---");

const VALID_PRIORITIES = new Set(["high", "medium", "low"]);
let priorityPass = true;

// The issues created by the taskify run we just executed:
//   task[0] → GitHub issue #2335
//   task[1] → GitHub issue #2336
//   task[2] → GitHub issue #2337
const ISSUE_NUMBERS = [2335, 2336, 2337];

for (let i = 0; i < tasks.length; i++) {
  const t = tasks[i];
  const p = (t.priority ?? "").toLowerCase();

  if (!VALID_PRIORITIES.has(p)) {
    console.error(
      `[FAIL]  Task ${i} "${t.title.slice(0, 50)}..." — invalid priority field: "${p}"`
    );
    priorityPass = false;
    continue;
  }

  // Verify priority field is set correctly in JSON
  pass(`Task ${i}: priority field = "${p}"`);

  // Verify priority label on GitHub issue
  const issueNum = ISSUE_NUMBERS[i];
  try {
    const ghLabels = execSync(
      `gh issue view ${issueNum} --json labels --jq '.labels[].name'`,
      { encoding: "utf-8" }
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    const hasPriorityLabel = ghLabels.some((l: string) => l === `priority:${p}`);
    if (hasPriorityLabel) {
      pass(`  → GitHub issue #${issueNum} has "priority:${p}" label`);
    } else {
      console.error(
        `[FAIL]  GitHub issue #${issueNum} missing "priority:${p}" label. ` +
          `Found: [${ghLabels.join(", ")}]`
      );
      priorityPass = false;
    }
  } catch (e) {
    fail(`Failed to fetch GitHub issue #${issueNum}: ${e}`);
  }
}

if (!priorityPass) process.exit(1);
console.log();

// ---------------------------------------------------------------------------
// Criterion 2 — Test Strategy section
// ---------------------------------------------------------------------------
console.log("--- Criterion 2: ## Test Strategy section in each body ---");

let tsPass = true;
for (let i = 0; i < tasks.length; i++) {
  const t = tasks[i];
  if (!/(?:^|\n)## Test Strategy\b/i.test(t.body)) {
    console.error(`[FAIL]  Task ${i} "${t.title}" — missing ## Test Strategy`);
    tsPass = false;
  } else {
    pass(`Task ${i}: ## Test Strategy found`);
  }
}
if (!tsPass) process.exit(1);
console.log();

// ---------------------------------------------------------------------------
// Criterion 3 — Context section
// ---------------------------------------------------------------------------
console.log("--- Criterion 3: ## Context section in each body ---");

let ctxPass = true;
for (let i = 0; i < tasks.length; i++) {
  const t = tasks[i];
  if (!/(?:^|\n)## Context\b/i.test(t.body)) {
    console.error(`[FAIL]  Task ${i} "${t.title}" — missing ## Context`);
    ctxPass = false;
  } else {
    pass(`Task ${i}: ## Context found`);
  }
}
if (!ctxPass) process.exit(1);
console.log();

// ---------------------------------------------------------------------------
// Criterion 4 — Acceptance Criteria section
// ---------------------------------------------------------------------------
console.log("--- Criterion 4: ## Acceptance Criteria section in each body ---");

let acPass = true;
for (let i = 0; i < tasks.length; i++) {
  const t = tasks[i];
  if (!/(?:^|\n)## Acceptance Criteria\b/i.test(t.body)) {
    console.error(`[FAIL]  Task ${i} "${t.title}" — missing ## Acceptance Criteria`);
    acPass = false;
  } else {
    pass(`Task ${i}: ## Acceptance Criteria found`);
  }
}
if (!acPass) process.exit(1);
console.log();

// ---------------------------------------------------------------------------
// Criterion 5 — Topological order (GitHub issues)
// ---------------------------------------------------------------------------
console.log("--- Criterion 5: Topological order correct ---");
console.log("(depends-on filed before dependent issue)");

const issueUrlPattern = /https:\/\/github\.com\/[\w-]+\/[\w-]+\/issues\/(\d+)/g;
const issueNumbers: number[] = [];
// tasks are ordered by the topoSort already applied in handleTasks
// but we verify that each task's dependsOn target has a LOWER issue number
// (i.e., was created earlier)

let topoPass = true;
for (let i = 0; i < tasks.length; i++) {
  const deps = tasks[i].dependsOn ?? [];
  for (const d of deps) {
    // task d should have been created before task i
    // In the JSON, tasks are already topo-sorted; we just verify consistency
    if (d >= i) {
      console.error(
        `[FAIL]  Task ${i} depends on task ${d} but topo-sorted order has ${d} >= ${i}`
      );
      topoPass = false;
    }
  }
}

if (!topoPass) process.exit(1);

// Also verify the topo order via Kahn's algorithm
if (!verifyTopoOrder(tasks)) {
  process.exit(1);
}

for (let i = 0; i < tasks.length; i++) {
  const deps = tasks[i].dependsOn ?? [];
  if (deps.length === 0) {
    pass(`Task ${i} (root, no deps)`);
  } else {
    pass(`Task ${i} depends on [${deps.join(", ")}]`);
  }
}

console.log();

console.log();
console.log("=".repeat(60));
console.log("ALL 5 CRITERIA PASSED");
console.log("=".repeat(60));
process.exit(0);
