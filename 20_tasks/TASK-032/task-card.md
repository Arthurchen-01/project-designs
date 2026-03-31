# TASK-032 - Boundary alignment contract for control-plane vs business repo

## What to do
Produce the explicit alignment contract that reconciles the accepted outputs of `TASK-031A` and `TASK-031B`.

Required scope:
- decide whether control-plane `dispatch/` replaces or complements business-repo `20_tasks/`
- map control-plane dispatch/status/review concepts onto the current business-repo lanes
- decide the source of truth for role definition: `agents/*/ROLE.md` vs workspace `AGENTS.md`
- decide where human-verification artifacts belong

Expected deliverable location for execution output:
- `30_execution/TASK-032-report.md`

## Why this task exists
`TASK-031A` and `TASK-031B` are both accepted, but they cannot be implemented together until the boundary between the future control-plane repo and the current business-repo workflow is made explicit.

## Constraints
- Decision/spec only; do not implement the repo yet
- Preserve the no-hidden-context rule
- Avoid duplicate sources of truth
- Provide a path-mapping table, not just prose

## Report back
Agent 2 should report:
1. the final boundary decisions
2. a path-mapping table between control-plane concepts and current repo lanes
3. the chosen source-of-truth rule for role files
4. migration notes and open risks
