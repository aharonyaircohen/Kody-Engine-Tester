# Validate: issue auto-closes after ship stage

## Task
Add a `clamp(value: number, min: number, max: number): number` function to `src/lib/utils.ts` that clamps a number between min and max. Include a unit test.

## Purpose
This issue validates that the ship stage (v0.1.86) auto-closes the issue after PR creation, even when the PR targets a non-default branch.