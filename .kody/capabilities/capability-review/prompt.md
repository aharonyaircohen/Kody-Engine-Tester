## Current persisted state

```
{{jobStateJson}}
```

# Capability Review

## Job

A **per-capability health check**. Each tick picks **one** capability from
`.kody/capabilities/` (round-robin) and deep-reviews whether it actually works —
not the plumbing (`system-audit` owns broken refs, missed ticks, stuck
dispatch), but the **design and observed behavior**: does this capability's
procedure achieve its stated goal, are its steps reachable, does its
cadence guard fire, and has it actually been running and producing output?

This capability cannot *execute* the capability it reviews — there is no way to prove a
capability works live. It reads the capability's instructions plus its real run history
(state file + recent commits + any report it writes) and reasons about
whether the logic is sound and the evidence shows it working. Static review
+ evidence, not a live test.

Purely diagnostic: it never edits, re-kicks, or relabels anything.
**Output is a report file, not an inbox comment** — each tick refreshes
`.kody/reports/capability-review.md`, a living roster of every capability with its
latest verdict, which the dashboard Reports page surfaces. The capability
reviewed this tick gets a fresh verdict; the others carry their last
verdict from state. Past states live in the file's git history.

**Cadence guard.** If `data.lastRunISO` is set and within the last 6 hours,
emit unchanged state and exit. Otherwise proceed and set `data.lastRunISO`
to now (UTC ISO) before emitting state.

## Tick procedure (one capability reviewed, one report write)

1. **Pin the repo.** `gh`'s default repo is not guaranteed here — resolve it
   once and pass `--repo` / `$REPO` everywhere:
   ```
   REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
   ```
   For A-Guy this resolves to `A-Guy-educ/A-Guy`, default branch `dev`.

2. **Enumerate capabilities.** List every `<slug>.md` in `.kody/capabilities/`:
   ```
   gh api "/repos/$REPO/contents/.kody/capabilities" -q '.[].name'
   ```
   Drop `.state.json` files and **drop `capability-review.md` itself** (don't
   review yourself — same self-exemption as `system-audit`).

3. **Pick the next capability.** From the enumerated slugs sorted alphabetically,
   pick the first one **not** in `data.reviewed`. If every capability is already
   in `data.reviewed`, a full cycle just finished — reset
   `data.reviewed = []`, bump `data.cycle`, and pick the first slug.

4. **Gather evidence** for the picked capability `<slug>`:
   - Body: `gh api "/repos/$REPO/contents/.kody/capabilities/<slug>.md"` (base64 →
     decode). Read the frontmatter (`every`, `agent`, `disabled`, `mentions`)
     and every section.
   - State: `gh api "/repos/$REPO/contents/.kody/capabilities/<slug>.state.json"`
     if it exists (404 = never ticked — itself a finding).
   - History: `gh api "/repos/$REPO/commits?path=.kody/capabilities/<slug>.state.json&per_page=10"`
     to see whether `lastRunISO` is actually advancing, and how often.
   - Report (if the capability writes one, e.g. `.kody/reports/<slug>.md`): fetch
     it to confirm output exists and isn't stale/empty.

5. **Run the review checklist.** Record one finding line per problem, each
   tagged `BROKEN` (the capability cannot achieve its goal as written / evidence
   shows it isn't working) or `WARN` (works but risky/wasteful/ambiguous):
   1. **Goal clarity** — does the `Job` section state one concrete,
      checkable goal? Vague or multi-goal bodies → `WARN`.
   2. **Procedure achieves the goal** — do the per-tick steps actually
      produce the stated output? Dead/unreachable steps, a step whose
      precondition can never be true, or a goal with no step that produces
      it → `BROKEN`.
   3. **Cadence guard correctness** — guard present and consistent with the
      `every:` frontmatter; `nextEligibleISO` formula matches the guard
      window. A guard that can never pass (always exits) or never blocks
      (no guard but a cadence implied) → `BROKEN`.
   4. **State contract** — body emits a closing `kody-job-next-state` block,
      and the schema it documents matches what the procedure actually
      writes. Missing block on a cadence-gated capability → `BROKEN`. Documented
      field never written → `WARN`.
   5. **One-action-max** — the procedure cannot fan out into multiple
      mutations in a single tick. A loop that comments/commits per item →
      `BROKEN`.
   6. **Idempotence / no churn** — a no-change tick produces byte-identical
      output (skip-PUT, quiet-on-clean, integer rounding, no timestamp in
      file bodies). Churn-on-every-tick → `WARN`.
   7. **Allowed-commands vs Restrictions** — the `Allowed Commands` don't
      grant more than the `Restrictions` claim to forbid; no internal
      contradiction. Mismatch → `WARN`.
   8. **Observed behavior** — from history: is `lastRunISO` advancing on
      roughly its cadence? Frozen state (never advanced since creation),
      no state file despite the body promising one, or a `cursor` stuck
      non-terminal for many ticks → `BROKEN`. `disabled: true` capabilities are
      reviewed for design but **not** flagged for being idle (disabled is
      intentional) — note the disabled status and move on.

   Distill to a one-word verdict for this capability: `healthy` / `warn` /
   `broken`, plus a short note (the single most important finding, or
   "passes every check" when healthy).

6. **Update the verdict map and rebuild the report.** Set
   `data.verdicts[<slug>] = { verdict, note }` for the capability reviewed this
   tick. Then rebuild the full roster body from `data.verdicts`:
   - H1 `# Kody Capability Review`, then a
     `_Rolling 6h cycle — one capability deep-reviewed per tick._` line (**no
     timestamp**; `lastRunISO` lives in state so a no-change tick is
     byte-identical).
   - A headline: `Cycle <N> — <healthy> healthy, <warn> warn, <broken> broken
     of <total> capabilities.`
   - A roster table, **one row per capability** (alphabetical), pulling verdict
     from `data.verdicts` (`—` / `pending` for any not yet reviewed in any
     cycle):
     ```
     | Capability | Agent | Cadence | Verdict | Note |
     |------|-------|---------|---------|------|
     | qa-sweep | qa | 7d | broken | state frozen 9 days; no sweep ran |
     ```
     Mark `disabled: true` capabilities in the Cadence column (e.g. `7d (disabled)`).

7. **Write the report** at **`.kody/reports/capability-review.md`** via `gh api`
   (fetch the prior sha so the PUT overwrites in place):
   ```
   sha=$(gh api "/repos/$REPO/contents/.kody/reports/capability-review.md" -q .sha 2>/dev/null || true)
   gh api -X PUT "/repos/$REPO/contents/.kody/reports/capability-review.md" \
     -f message="chore(capability-review): refresh report" \
     -f content="$(printf '%s' "$REPORT_BODY" | base64)" \
     -f branch="<defaultBranch>" \
     ${sha:+-f sha="$sha"}
   ```
   `<defaultBranch>` is `dev` for A-Guy. **One PUT per tick.**

8. **Emit closing state** (schema below) as the very last thing in the reply,
   recording the slug reviewed this tick and its verdict.

## Allowed Commands

- `gh repo view` — pin the repo.
- `gh api` reads against `/repos/$REPO/contents/.kody/capabilities`, individual
  capability bodies, their `.state.json` files, `.kody/reports/*`, and
  `/repos/$REPO/commits?path=...` for run history.
- `gh api -X PUT` against `.kody/reports/capability-review.md` **only** — to write
  the report. Permitted by the global capability-tick contract.

## Restrictions

- **Read-only on every capability, state file, report, PR, and issue.** The
  **only** write is the single PUT to `.kody/reports/capability-review.md`. Never
  edit, re-kick, relabel, or "fix" the capability you're reviewing — surface it on
  the report; the operator decides.
- **One report write per tick**, covering at most one freshly-reviewed capability.
  Never open issues or post comments — this capability has no inbox surface by
  design.
- **No timestamp in the report body.** `lastRunISO` lives in state, so a tick
  that produces an identical roster is byte-identical (skip-PUT is free).
- **Don't review yourself** (`capability-review`) — self-exempt, like
  `system-audit`.
- **`disabled: true` is not a finding** for the "observed behavior" check —
  disabled capabilities are idle by intent. Still review their design; mark them
  disabled in the roster.
- **Static review + evidence only.** Never claim a capability "works" — claim its
  design is sound and its history shows it running. The two are different.

## State

The engine writes `capability-review.state.json` from the closing block below.

- `cursor`: `reported` after any tick past the cadence guard.
- `data.lastRunISO`: UTC ISO timestamp of the last tick that ran past the
  cadence guard.
- `data.nextEligibleISO`: always `lastRunISO + 6h`. **Always emit this,
  every tick** — surfaced as "next run" on the dashboard.
- `data.cycle`: integer, incremented each time a full sweep completes.
- `data.reviewed`: array of slugs reviewed in the **current** cycle (reset
  to `[]` when the cycle completes).
- `data.verdicts`: `{ "<slug>": { "verdict": "healthy|warn|broken", "note": "..." } }`
  — the latest verdict for every capability ever reviewed; the report roster is
  rebuilt from this each tick.
- `done`: always `false` — this capability is evergreen.

Closing block shape:

````
```kody-job-next-state
{
  "cursor": "reported",
  "data": {
    "lastRunISO": "<now ISO>",
    "nextEligibleISO": "<now ISO + 6h>",
    "cycle": <n>,
    "reviewed": ["architecture-audit", "cleanup-branches"],
    "verdicts": {
      "architecture-audit": { "verdict": "healthy", "note": "passes every check" },
      "cleanup-branches": { "verdict": "warn", "note": "no idempotence guard; churns on no-op" }
    }
  },
  "done": false
}
```
````

## Emit your next state (required when the steps above mention state)
Output your next state as the LAST thing you write, as a fenced block labeled exactly `kody-job-next-state` containing JSON like `{"cursor":"<state>","data":{...},"done":false}`. Omit it only if nothing changed.
