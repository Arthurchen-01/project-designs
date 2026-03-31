# TASK-031A — Control-plane repo skeleton (directory/file map)

## Goal
Define the minimal control-plane repository skeleton for the new multi-agent productization direction.

This task only covers the **repository layout and file map**.
It must not drift into status schema semantics or handoff/verification protocol content.

## Scope
Produce a proposal that defines:
- top-level directories
- purpose of each directory
- mandatory M1 files
- separation between control repo and target business repos

## Write scope (strict)
Agent 2 may write only within:
- `30_execution/TASK-031A-report.md`
- `30_execution/STATUS-REPORT.md`
- `30_execution/HANDOFF.md`

Agent 2 must **not** write to:
- `30_execution/TASK-031B-report.md`
- any `40_review/` file
- any architecture file
- any task file outside its own execution report updates

## Acceptance standard
Pass if the output:
1. clearly defines the minimal repo skeleton
2. keeps scope at M1 structure only
3. clearly separates control-plane vs business-repo responsibilities
4. is specific enough for Agent 1 to dispatch the next implementation packet

## Required write-back format
Write `30_execution/TASK-031A-report.md` with these sections:
1. Proposed structure
2. Why this split is minimal
3. M1 mandatory files
4. Open questions / risks
