# Runtime Status

- current_state: DAYTIME_ACTIVE
- active_project: AP tracking site
- active_batch: M05-S02-R02
- branch_of_record: nightly/2026-03-31-confidence-fix
- code_repo: https://github.com/Arthurchen-01/ap-tracker.git
- last_updated_by: agent3 (mode switch on user request)
- last_updated: 2026-03-31T15:12+08:00
- agent1_state: AWAITING_REVIEW
- agent1_target: TASK-029 confidence semantics fix
- agent2_state: DONE
- agent2_target: TASK-029
- agent3_state: DONE
- agent3_target: TASK-029
- notes: |
  Phase 4 core is complete and approved.

  TASK-029 完成：pass daysSinceLastRecord to confidence calculation
  - commit: 2dae7d9
  - confidence.ts 接受 daysSinceLastRecord 参数
  - 高置信：recordCount >= 5 且 daysSince <= 30
  - 中置信：recordCount >= 2 且 daysSince <= 60
  - 低置信：其余
  - scoring-engine.ts 已更新调用方

  TASK-029 reviewed by Agent 3 — PASS. Task folders cleaned up.

  Follow-up candidates for next batch:
  - advice API N+1 optimization
  - dashboard alerts frontend wiring
  - error boundary around chart-heavy personal pages
