# TASK-033 - Repo-ready starter pack from approved M1 contract

## What to do
After `TASK-032` resolves the boundary and source-of-truth decisions, produce the first repo-ready starter pack for the control-plane repo.

Required scope:
1. starter `README.md` outline
2. `config/agents.yaml` skeleton
3. `config/rules.yaml` skeleton
4. `status/STATUS.md` starter template placement
5. `docs/operating-model.md` outline
6. `docs/memory-model.md` outline
7. explicit placement for handoff, reading-order, and human-verification templates

Expected deliverable location for execution output:
- `30_execution/TASK-033-report.md`

## Why this task exists
`TASK-031A` and `TASK-031B` already provide the raw structure and template set. After `TASK-032` aligns the boundaries, the next useful step is a concrete starter pack that can be scaffolded without rethinking the design.

## Constraints
- Do not start until `TASK-032` decisions are available
- Starter-file outlines only; no runtime implementation
- Reuse accepted material from `TASK-031A` and `TASK-031B` instead of redefining it
- Keep M1 small and explicit

## Report back
Agent 3 should report:
1. the starter file list
2. the content outline for each starter file
3. which items can be scaffolded immediately and which are deferred
