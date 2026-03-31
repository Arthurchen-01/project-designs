# TASK-032 — Structured STATUS model template

## What to do
Produce a concrete structured STATUS template based on the approved direction:
- `system`
- `roles`
- `assignments`
- `last_cycle`

Also include a short derived Markdown rendering example.

Expected deliverable location for execution output:
- `30_execution/TASK-032-report.md`

## Why this task exists
Current STATUS semantics are ambiguous across mode switches. This task turns the product direction into a concrete template that can later be adopted in the control-plane repo.

## Constraints
- Template only; do not rewrite the entire live system runtime
- Keep field naming explicit
- Show both machine-readable structure and human-readable rendering direction

## Report back
Agent 2 should report:
1. the proposed schema
2. why each section exists
3. how mode switch semantics are preserved without mixing old task state into current live state
