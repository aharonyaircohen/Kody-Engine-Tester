---
every: 15m
---
# Live Heartbeat

## Worker

Connectivity heartbeat used to verify the engine's `worker-scheduler` is
live and ticking `.kody/workers/`. Take **no** GitHub action of any kind.
Each tick: increment `data.ticks` by 1 (start at 0 if absent) and set
`data.lastTickISO` to the current UTC ISO timestamp. That is the entire job.

## Allowed Commands

(none — read-only heartbeat, issues no Kody commands)

## Restrictions

- Do not post or edit comments, issues, PRs, labels, or milestones.
- Do not run any `gh` write or any `git` operation.
- Take no action other than emitting the next-state block.

## State

- `cursor`: `idle`
- `data.ticks`: integer count of ticks observed
- `data.lastTickISO`: ISO timestamp of the most recent tick
- `done`: always `false`
