# TASK-028

## Batch

- Batch ID: M05-S01-R01
- Assignee: Agent 3
- Type: product and UX review

## Objective

Perform product and UX review for the overnight run on the current nightly branch after role correction:

- Repo: `https://github.com/Arthurchen-01/ap-tracker.git`
- Branch: `nightly/2026-03-31-confidence-fix`

Focus on:

- student clarity
- teacher usefulness
- manager-level structure and direction
- UX friction
- wording, explanation, and path smoothness visible from the current branch state

## Required output

Write a review packet into `40_review/` that contains:

1. top 5 blockers or gaps
2. which are user-facing vs secondary
3. what Agent 1 should improve first
4. what Agent 1 should dispatch next

## Guardrails

- do not modify execution artifacts in `30_execution/`
- do not rewrite architecture
- do not accept new scope from chat
- act as a reviewer, not as a second executor
