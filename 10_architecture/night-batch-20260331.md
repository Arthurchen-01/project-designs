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
  - command center only
  - no direct execution artifacts in `30_execution/`
  - issue the next smallest packet after each report

- Agent 2:
  - pull the code repo branch
  - implement one coherent overnight improvement batch
  - verify build and API/config status where possible
  - push changes to the nightly branch
  - write concise execution report back here

- Agent 3:
  - perform a baseline review immediately
  - focus on student/teacher clarity, product flow, and risk
  - after Agent 2 pushes a fresh batch, review again in the next cycle if needed

## First cycle objective

Start both execution and review immediately without waiting for another user message.

### Track A: Agent 2

Target: `TASK-027`

Expected outcome:

- synced local runtime copy of the nightly branch
- one pushed improvement batch
- build verification
- API/config findings recorded

### Track B: Agent 3

Target: `TASK-028`

Expected outcome:

- baseline review of current nightly branch/product state
- top blockers ranked by user impact
- clear recommendation for Agent 1's next dispatch

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
