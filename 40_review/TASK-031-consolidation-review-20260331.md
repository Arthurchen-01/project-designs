# TASK-031 Consolidation Review - 2026-03-31

## Verdict

- `TASK-031A`: ACCEPTED as control-plane skeleton input
- `TASK-031B`: ACCEPTED as template/protocol input
- Direct scaffolding should NOT proceed until one alignment pass resolves repo-boundary and source-of-truth conflicts

## Findings

### P1 - Control-plane dispatch model conflicts with current task-lane model

`TASK-031A` proposes a control-plane repo centered on `dispatch/inbox -> active -> done` and explicitly excludes business-repo lanes such as `20_tasks/`, `30_execution/`, and `40_review/`.

`TASK-031B` still treats the current `20_tasks/`, `30_execution/`, and `40_review/` lanes as authoritative coordination paths in both the protocol and reading-order templates.

Without an explicit mapping rule, these two outputs cannot be implemented together without creating two competing task systems.

### P1 - Original `TASK-032` and `TASK-033` would duplicate work

`TASK-031B` already provides:

- a concrete structured STATUS template
- a handoff template
- a reading-order template
- a human-verification template

Running the original `TASK-032` and `TASK-033` unchanged would likely generate second versions of material that already exists, increasing drift instead of reducing it.

### P2 - Role-definition source of truth remains ambiguous

`TASK-031A` introduces `agents/*/ROLE.md` as the control-plane role declaration.

`TASK-031B` still starts cold-start reading from workspace `AGENTS.md`.

We need one explicit rule:

1. either control-plane `ROLE.md` is primary and workspace `AGENTS.md` is derived
2. or workspace `AGENTS.md` remains primary and control-plane role files are mirrors

## Consolidation Decision

- Keep the `TASK-031A` directory skeleton direction
- Keep the `TASK-031B` template/protocol set
- Rescope `TASK-032` to boundary alignment and path/source-of-truth decisions
- Hold `TASK-033` until `TASK-032` completes, then turn approved decisions into a repo-ready starter pack

## Next Action

- Agent 2: execute the respecified `TASK-032`
- Agent 3: hold until post-`TASK-032` starter-pack work is dispatched
