# Night Batch Plan 2026-03-31

## Working model

This is a coordinated overnight run with one code branch and one coordination repo.

### Coordination layer

- Repo: shared three-agent workspace
- Purpose: input, routing, dispatch, execution reports, review reports

### Code layer

- Repo: `https://github.com/Arthurchen-01/ap-tracker.git`
- Active branch: `nightly/2026-03-31-confidence-fix`

## Roles for this batch

- Agent 1:
  - command center plus main overnight developer
  - owns the night branch implementation loop
  - keeps development in the local night repo and on the nightly branch
  - uses review outputs from Agent 2 and Agent 3 to decide the next smallest packet

- Agent 2:
  - do not act as the main executor for this run
  - perform technical review of Agent 1 changes
  - verify build, API/config status, and obvious code/runtime risk where possible
  - write concise technical review back here

- Agent 3:
  - perform product and UX review of Agent 1 changes
  - focus on student and teacher clarity, product flow, wording, and risk
  - review again after fresh night-branch pushes when needed

## First cycle objective

Start development and review immediately without waiting for another user message.

### Track A: Agent 1

Target: continue direct development in the night repo and on `nightly/2026-03-31-confidence-fix`

Expected outcome:

- one or more pushed improvement batches
- build verification
- API/config findings recorded

### Track B: Agent 2

Target: `TASK-027`

Expected outcome:

- technical review of the latest nightly branch state
- top blockers ranked by build, runtime, API, and implementation risk
- clear recommendation for Agent 1's next development batch

### Track C: Agent 3

Target: `TASK-028`

Expected outcome:

- product and UX review of the latest nightly branch state
- top blockers ranked by student and teacher impact
- clear recommendation for Agent 1's next product-focused batch

## Priority order for product decisions

1. clearer main path
2. better explanation of current result / stability / reason / next step
3. less friction on daily update and key user actions
4. API/config reality over fake completeness
5. polish after clarity

## Constraints

- No work on `main`
- No destructive schema or data changes without explicit need
- No uncontrolled scope expansion
- Prefer shipping a clearer morning demo over broad unfinished change volume
