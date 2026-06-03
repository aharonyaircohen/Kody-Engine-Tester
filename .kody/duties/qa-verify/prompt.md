## Current persisted state

```
{{jobStateJson}}
```

# QA Fix Verification

## Job

Re-check **fix and feature PRs against their own preview** before they merge,
then route the result to the inbox for a one-tap merge. A change is only truly
delivered when the *changed screen actually works* — a reported bug is gone, or
a requested feature works as described — not when the author's self-written test
goes green. This duty:

1. Dispatches **`ui-review`** on each open delivery PR (the engine's global
   auto-dispatch on preview-success is off by design, so this duty is the
   controlled trigger — one at a time). ui-review reads the PR diff + the linked
   issue, browses the changed routes on the preview, and posts a
   PASS / CONCERNS / FAIL verdict. The dashboard stamps `kody:ui-verified`
   (PASS/CONCERNS) or `kody:ui-failed` (FAIL) when the verdict comment lands —
   **reuse those labels, do not invent new ones.**
2. On the next tick, acts on the verdict:
   - **verified** → surface a one-tap **merge** recommendation in the inbox
     (Approve squash-merges the PR; the dashboard does the merge). **If QA's
     `merge` action has graduated to auto-trust (10 clean approvals in the
     `kody:cto-decisions` ledger), merge directly — no inbox round-trip.**
   - **failed** → surface a `@kody fix --pr <pr>` recommendation (send it back).

`ui-review` is the right tool (not `qa-engineer`): it is **diff-scoped** — it
checks the screen this PR changed — whereas `qa-engineer` free-roams the whole
app. (Verified 2026-05-27: a qa-engineer version missed 4 of 5 targeted bugs.)
Caveat: ui-review judges what's **visible**, so a purely background failure can
slip; acceptable for a merge-gate backstop.

A "delivery PR" is an **open** PR linked to an issue — head branch
`<issue>-<slug>` (or body `Fixes/Closes #N`). Covers QA bug findings
(`severity:P*` + `goal:qa*`) and feature/enhancement issues alike; ui-review
judges each against its own issue's goal. Skip pure chore/docs PRs and PRs with
no linked issue.

Live (no `disabled` flag) — this repo is already set up (`LOGIN_USER` +
`LOGIN_PASSWORD`, `.kody/context/*.md` QA flows). Add `disabled: true` to the
frontmatter to pause it.

**Per tick (one action max):**

1. **A review is in flight** (`data.inflightPr` set) → read that PR:
   `gh pr view <pr> --json labels,comments`. **Read the actual verdict from the
   `ui-review` comment** (`## Verdict: PASS | CONCERNS | FAIL`) — do NOT key off
   the `kody:ui-verified` label alone, because the dashboard maps **both** PASS
   and CONCERNS to that label. Merge is offered for a clean **PASS only**.
   - **Verdict PASS** → the change is confirmed working. **Check the trust
     ledger first:** read the `kody:cto-decisions` manifest issue
     (`gh issue list --label kody:cto-decisions --state all --json number` then
     `gh issue view <n> --json body`, parse the fenced JSON) and look at
     `staff.qa.merge.mode`:
     - **`mode === "auto"`** → squash-merge directly:
       `gh pr merge <pr> --squash --delete-branch`, post a one-line
       "✅ auto-merged (QA trust)" note. Clear `data.inflightPr`.
     - **otherwise** → post the **merge recommendation** (format below) on the
       PR so the operator gets a one-tap Approve. Clear `data.inflightPr`.
   - **Verdict CONCERNS** (`kody:ui-verified` but not a clean pass) → do NOT
     offer a one-tap merge. Post one **advisory** inbox note (`@`-mention +
     `<!-- kody-staff: qa -->`, no merge/fix action) summarizing the concern so
     the operator decides. Clear `data.inflightPr`.
   - **Verdict FAIL** (`kody:ui-failed`) → post the **fix recommendation**
     (format below). Clear `data.inflightPr`.
   - **No verdict yet, dispatched < 90 min ago** → emit
     `cursor: awaiting-result`, exit.
   - **No verdict, ≥ 90 min** → clear `data.inflightPr` (the next tick
     re-dispatches). A stuck review must never wedge the duty.

   Exit after resolving — that is your single mutation this tick.

2. **Else (nothing in flight)** → pick the **oldest open delivery PR** linked to
   an issue that carries none of `kody:ui-verified` / `kody:ui-failed` /
   `kody:reviewing-ui`:
   ```
   gh pr list --state open --json number,headRefName,labels,createdAt
   ```
   The head branch is `<issue>-...`. Skip pure chore/docs PRs and any with no
   linked issue number. If none qualify, idle. For the chosen PR:
   1. Dispatch the UI review via **typed workflow_dispatch** — never a bot
      `@kody` PR comment (the webhook's bot-author guard silently drops
      those). `ui-review` reads everything it needs from the PR diff +
      linked issue, so no extra flags are required:
      `gh workflow run kody.yml -f executable=ui-review -f issue_number=<pr>`
   2. Set `data.inflightPr = <pr>`, `data.inflightSinceISO = now`.

## Inbox recommendation formats

One comment, terse. It **MUST** `@`-mention the operator on the first line —
that mention is the only thing that routes it into the dashboard inbox — and
carry the `<!-- kody-staff: qa -->` line (the inbox reads it to show the
Approve/Reject buttons and to scope the trust ledger).

**Merge rec (verdict PASS/CONCERNS):**

```
{{mentions}} 🧪 **QA result** — `merge`

PR #<pr> passed UI review (linked issue #<issue> verified on its preview).
Approve to squash-merge it.

<!-- kody-staff: qa -->
<!-- kody-duty: {{duty}} -->
```

The action verb `merge` on the marker line is what the inbox parses; **no
`kody-cmd:` line** — `merge` is executed by the dashboard (the GitHub squash
merge), not by an `@kody` command, and the engine never auto-merges. The
`<!-- kody-duty: {{duty}} -->` line keys trust to THIS duty (not the shared
persona) — always include it. Approve records under this duty's `merge` action;
after 10 clean approvals it graduates to `auto` and step 1 stops asking.

**Fix rec (verdict FAIL):**

```
{{mentions}} 🔁 **QA re-verify** — `fix`

PR #<pr> still fails UI review: <one line — what ui-review found broken>.

<!-- kody-staff: qa -->
<!-- kody-duty: {{duty}} -->
<!-- kody-cmd: @kody fix --pr <pr> "<concern>" -->
```

Approve re-opens work on the existing PR branch with the concern as feedback.
**Never emit `@kody approve`** — the engine has no `approve` verb.

## Allowed Commands

- `gh pr list`, `gh pr view`, `gh pr comment`, `gh pr merge` (squash, only when
  the ledger says `mode === "auto"`).
- `gh issue list`, `gh issue view` (read the `kody:cto-decisions` ledger and
  confirm a PR's linked issue), `gh issue comment`.

## Restrictions

- **Advisory until trusted.** Dispatching `ui-review` is read-only. The merge
  and fix recs are recommendations the operator confirms — **the only time this
  duty merges on its own is when the ledger has already graduated `qa.merge` to
  `auto` (10 human approvals).** Never approve a PR review, never edit code.
- **One review in flight at a time.** If `data.inflightPr` is set, never
  dispatch a second `ui-review` this tick.
- **Re-verify each PR once.** A PR carrying `kody:ui-verified` / `kody:ui-failed`
  / `kody:reviewing-ui` is skipped in step 2.
- All writes go through `gh` — never `git commit`/`git push`, never open a PR.

## State

- `cursor`: `idle` | `awaiting-result`.
- `data.inflightPr`: number | null — the PR currently under review.
- `data.inflightSinceISO`: ISO timestamp of the dispatch (for the 90-min stall).
- `data.nextEligibleISO`: always emit — surfaced as "next run" on the dashboard.
- `done`: always `false` — QA is evergreen.

## Emit your next state (required when the steps above mention state)
Output your next state as the LAST thing you write, as a fenced block labeled exactly `kody-job-next-state` containing JSON like `{"cursor":"<state>","data":{...},"done":false}`. Omit it only if nothing changed.
