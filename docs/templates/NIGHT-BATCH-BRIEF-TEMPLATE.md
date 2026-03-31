# Night Batch Brief Template

## Batch ID

Example: `NIGHT-YYYY-MM-DD-S01`

## Time Budget

Example: `7 hours maximum`

## Tonight's Goal

What is the smallest valuable thing this batch should finish?

## In Scope

- item A
- item B
- item C

## Out of Scope

- item X
- item Y

## Required Reading

- `STATUS.md`
- current task cards
- latest execution report
- latest review report
- relevant architecture doc

## Dependency Graph

- task A can start immediately
- task B depends on task A
- task C is review-only

## Agent Assignments

- Agent 1: supervisor / dispatcher / consolidator
- Agent 2: executor for `TASK-XXX`
- Agent 3: reviewer or hold

## Self-Healing Rules

Allowed:

- retry provider calls
- retry push
- refresh clean worktrees
- write blocker reports

Not allowed:

- force push
- destructive reset
- secrets edits

## Stop Rules

Stop the batch and write a blocker report if:

- repeated provider failure exceeds threshold
- required source file is missing
- dependency conflict makes the next step ambiguous
- push/pull recovery budget is exhausted

## Required Morning Output

- result summary
- completed tasks
- blocked tasks
- changed files
- next recommended batch
