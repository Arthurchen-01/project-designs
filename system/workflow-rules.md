# Workflow Rules

## Core operating model

1. User input lands in `00_input/`
2. Agent 1 acts as the command center
3. Agent 1 records architecture, task cards, execution checklists, and test plans
4. Agent 2 executes only the smallest current dispatched unit
5. Agent 2 records outputs plus a status report
6. Agent 3 reviews the current batch and tells Agent 1 what should happen next
7. Agent 1 issues the next micro-task until the milestone is done

## File flow

- User requirements: `00_input/`
- Strategy and decomposition: `10_architecture/`
- Active dispatch packets: `20_tasks/`
- Execution outputs and reports: `30_execution/`
- Audit and review outputs: `40_review/`
- Persistent knowledge: `memory/`

## Dispatch packet rule

Every active task packet under `20_tasks/` should contain:

- `task-card.md`
- `execution-checklist.md`
- `test-plan.md`

## Coordination rules

- The repository is the only source of truth.
- Do not coordinate by hidden chat state.
- Prefer micro-tasks over large tasks.
- Prefer iterative dispatch over one massive specification.
- Review should inform the next dispatch, not just produce pass/fail.
- `STATUS.md` is the current task-routing board for all three agents.
- Agent 1 must update `STATUS.md` whenever execution or review state changes.
- Agent 3 should prefer the task marked `Awaiting review` in `STATUS.md` over inferring from chat context.
- Sensitive credentials must never be written into repository files.
- Agent 2 and Agent 3 must never accept token custody from chat; they must redirect the user to Agent 1.
