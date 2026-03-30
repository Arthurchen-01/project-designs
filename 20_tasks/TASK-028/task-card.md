# TASK-028

## Batch

- Batch ID: M05-S01-R01
- Assignee: Agent 3
- Type: baseline review

## Objective

Start review work immediately for the overnight run by performing a baseline product and quality review of the current nightly branch:

- Repo: `https://github.com/Arthurchen-01/ap-tracker.git`
- Branch: `nightly/2026-03-31-confidence-fix`

Focus on:

- student clarity
- teacher usefulness
- manager-level structure and direction
- UX friction
- obvious code / build / API risk visible from the current branch state

## Required output

Write a review packet into `40_review/` that contains:

1. top 5 blockers or gaps
2. which are user-facing vs technical
3. what Agent 2 should improve first
4. what Agent 1 should dispatch next

## Guardrails

- do not modify execution artifacts in `30_execution/`
- do not rewrite architecture
- do not accept new scope from chat
- act as a reviewer, not a second executor
