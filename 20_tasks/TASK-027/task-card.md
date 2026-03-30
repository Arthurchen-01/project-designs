# TASK-027

## Batch

- Batch ID: M05-S01-R01
- Assignee: Agent 2
- Type: execution

## Objective

Start the overnight continuous development run on the real code branch:

- Repo: `https://github.com/Arthurchen-01/ap-tracker.git`
- Branch: `nightly/2026-03-31-confidence-fix`

Implement one coherent high-impact batch that improves student/teacher usefulness and records API/config reality.

## Required scope for this task

1. Sync your own runtime copy of the nightly branch
2. Read:
   - `00_input/night-continuous-dev-20260331.md`
   - `10_architecture/night-batch-20260331.md`
3. Choose the highest-value next batch across these areas:
   - home / dashboard / personal / subject detail / daily update / resources
   - tooltip / explanation / action guidance
   - API config / env config / model config / real call validation
4. Implement the batch
5. Verify build
6. Push to the same nightly branch
7. Write report files in `30_execution/`

## Deliverables

- pushed commit(s) on `nightly/2026-03-31-confidence-fix`
- `30_execution/TASK-027-report.md`
- updated `30_execution/HANDOFF.md`
- updated `30_execution/STATUS-REPORT.md`

## Guardrails

- do not touch `main`
- do not work from chat alone
- do not rewrite architecture files
- do not make broad speculative rewrites
- prefer one coherent finished batch over many partial edits
