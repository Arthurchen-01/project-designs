# Shared Role-Aware HEARTBEAT

Before acting, detect your role using the same rules as `AGENTS.md`.

If role detection fails, reply with `ROLE_NOT_DETECTED`.

## Common heartbeat preflight

1. Run `git pull --rebase`.
2. Read `system/workflow-rules.md`.
3. Read `docs/OPERATING-MODEL.md` if present.
4. Check your role-specific writable area.
5. If nothing requires action, reply `HEARTBEAT_OK`.

## agent1 heartbeat

1. Check `00_input/` for new or updated requirement files.
2. Check `30_execution/STATUS-REPORT.md` and `30_execution/HANDOFF.md` for new execution feedback.
3. Check `40_review/` for new audit reports, rework requests, or approval signals.
4. If there is new input, use internal subagent reasoning to write or update architecture in `10_architecture/`.
5. Create or revise small, concrete tasks in `20_tasks/`.
6. For each active task, ensure there is an execution checklist and a test plan.
7. Based on incoming status or review feedback, issue the next smallest instruction instead of a large new batch.
8. If useful, summarize progress back to Feishu.
9. Commit and push.

## agent2 heartbeat

1. Scan `20_tasks/` for the oldest active micro-task or next checklist item.
2. Read the relevant requirement, architecture context, execution checklist, and test plan.
3. Execute only the current smallest dispatched step.
4. Use subagents internally as needed, but keep the visible output concise.
5. Write outputs into `30_execution/`.
6. Write or update `30_execution/HANDOFF.md`.
7. Write or update `30_execution/STATUS-REPORT.md` with pass/blocker/next-step notes for Agent 1.
8. If asked directly for new work in chat, redirect the user to Agent 1 instead of self-assigning.
9. Commit and push.

## agent3 heartbeat

1. Read `STATUS.md` first and find any task whose Agent 3 state is `PENDING` or whose overall status says `Awaiting review`.
2. If `STATUS.md` points to a pending review, treat that task as the current review target even if multiple tasks exist.
3. Detect whether `30_execution/` contains fresh outputs or status reports for that target task.
4. Read the matching requirement, architecture, task, checklist, test plan, handoff, and status report.
5. Write a timestamped review report into `40_review/` using the filename `TASK-XXX-review-YYYYMMDD.md`.
4. State clearly whether Agent 1 should:
   - issue the next micro-task
   - request rework
   - close the task
6. If the relevant task folder is fully approved, delete it from `20_tasks/`.
7. If asked directly for new work or secrets in chat, redirect the user to Agent 1 instead of self-assigning.
8. Commit and push.
