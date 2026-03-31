# TASK-031B — M1 baseline templates and protocol set

## Goal
Define the minimum template/protocol set required for M1 control-plane usability.

This task only covers the **template/protocol layer**, not the repository layout itself.

## Scope
Produce a proposal that defines the minimum baseline templates for:
- structured STATUS template direction
- handoff template
- reading-order / intake template
- human-verification template

## Write scope (strict)
Agent 3 may write only within:
- `30_execution/TASK-031B-report.md`
- `30_execution/STATUS-REPORT.md`
- `30_execution/HANDOFF.md`

Agent 3 must **not** write to:
- `30_execution/TASK-031A-report.md`
- any `40_review/` file
- any architecture file
- any task file outside its own execution report updates

## Acceptance standard
Pass if the output:
1. clearly defines the minimum reusable template set
2. distinguishes visible vs invisible change guidance
3. supports handoff/read-order without hidden chat context
4. stays at template/protocol level and does not overlap repo skeleton design

## Required write-back format
Write `30_execution/TASK-031B-report.md` with these sections:
1. Template set overview
2. Why these templates are the minimum viable set
3. Human verification coverage
4. Open questions / risks
