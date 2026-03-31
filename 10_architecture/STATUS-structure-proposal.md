# STATUS Structure Proposal

## Purpose

This document proposes a new STATUS structure to replace the current top-level mixed state model.

Current problem:
- `STATUS.md` currently mixes **previous-mode task progress** with **current-mode role meaning**.
- Example: after switching from night mode back to day mode, `agent1_state: AWAITING_REVIEW` still reflects the last night task, even though Agent 1 in day mode is no longer acting as a reviewer-facing developer and should instead be planning/dispatching.
- This creates interpretation errors for humans and future agents.

Core rule:

> On mode switch, previous-mode task state must not remain in the current mode's top-level live state.

---

## Proposed model

Split STATUS into four layers:

1. `system` — current global mode state
2. `roles` — current mode role mapping
3. `assignments` — each agent's current active work state
4. `last_cycle` — archived summary of the previous mode / batch

Recommended structure:

```yaml
system:
  current_mode: DAY_INTERACTIVE
  current_phase: PLANNING
  active_profile: DAY_INTERACTIVE
  capacity_mode: FULL_3
  branch_of_record: main
  active_project: collab-os
  last_updated: 2026-03-31T15:30+08:00
  last_updated_by: agent1

roles:
  agent1:
    role: PLANNER
    responsibility: intake_planning_dispatch
  agent2:
    role: EXECUTOR
    responsibility: execution_delivery
  agent3:
    role: REVIEWER
    responsibility: review_audit

assignments:
  agent1:
    state: PLANNING
    current_task: null
    current_focus: next_batch_planning
  agent2:
    state: IDLE
    current_task: null
    current_focus: waiting_dispatch
  agent3:
    state: IDLE
    current_task: null
    current_focus: waiting_review_target

last_cycle:
  mode: NIGHT_CONTINUOUS
  batch: M05-S02-R02
  branch_of_record: nightly/2026-03-31-confidence-fix
  summary: TASK-029 reviewed PASS, nightly batch complete
  closed_tasks:
    - TASK-027
    - TASK-029
  result: COMPLETE
  review_status: PASS

next_candidates:
  - advice API N+1 optimization
  - dashboard alerts frontend wiring
  - chart-heavy personal pages error boundary
```

---

## Field semantics

### 1. `system`
Represents the current global mode state.

Suggested fields:
- `current_mode`
- `current_phase`
- `active_profile`
- `capacity_mode`
- `branch_of_record`
- `active_project`
- `last_updated`
- `last_updated_by`

### 2. `roles`
Represents the current role mapping under the active mode.

Important:
- `roles` is mode-level meaning
- it should change on mode switch
- it must not carry previous task semantics

Examples:
- Day mode: Agent1 = planner, Agent2 = executor, Agent3 = reviewer
- Night mode: Agent1 = developer, Agent2 = tech reviewer, Agent3 = product reviewer

### 3. `assignments`
Represents each agent's current live work state.

Suggested fields:
- `state`
- `current_task`
- `current_focus`

Important:
- `assignments` is live state
- it must be reset or recomputed on mode switch
- previous-mode task state must not remain here by default

### 4. `last_cycle`
Represents archived summary of the previous mode / previous batch.

Purpose:
- preserve what just happened
- avoid polluting the current live state
- improve handoff and human readability

### 5. `next_candidates`
Represents useful follow-up candidates for the planner.

---

## Mode switch rules

### Night → Day

Required actions:
1. Archive the closing night batch into `last_cycle`
2. Set `system.current_mode = DAY_INTERACTIVE`
3. Update `roles`
   - agent1 → PLANNER
   - agent2 → EXECUTOR
   - agent3 → REVIEWER
4. Reset `assignments`
   - agent1.state = PLANNING
   - agent2.state = IDLE
   - agent3.state = IDLE
   - clear or recompute `current_task`
5. Move carry-over ideas into `next_candidates`

### Day → Night

Required actions:
1. Archive the day planning/dispatch summary into `last_cycle`
2. Set `system.current_mode = NIGHT_CONTINUOUS`
3. Update `roles`
   - agent1 → DEVELOPER
   - agent2 → TECH_REVIEW
   - agent3 → PRODUCT_REVIEW
4. Initialize `assignments` for the night batch
5. Update `branch_of_record` to the active night branch

---

## Why this is better

### 1. Separates role meaning from task progress
Prevents humans from reading previous task progress as current role meaning.

### 2. Makes mode switching deterministic
No need to guess which top-level fields should be preserved.

### 3. Improves handoff
A new agent can quickly answer:
- what mode are we in?
- what role does each agent currently have?
- what is each agent doing right now?
- what just finished last cycle?

### 4. Better for future automation
Programs can read structured YAML/JSON.
Humans can read derived Markdown.

---

## Markdown STATUS rendering suggestion

```markdown
# Runtime Status

## Current Mode
- mode: DAY_INTERACTIVE
- phase: PLANNING
- capacity: FULL_3
- project: collab-os
- branch_of_record: main

## Current Roles
- agent1: PLANNER
- agent2: EXECUTOR
- agent3: REVIEWER

## Current Assignments
- agent1: PLANNING — next_batch_planning
- agent2: IDLE
- agent3: IDLE

## Last Cycle Summary
- previous_mode: NIGHT_CONTINUOUS
- batch: M05-S02-R02
- result: PASS
- closed_tasks: TASK-027, TASK-029

## Next Candidates
- advice API N+1 optimization
- dashboard alerts frontend wiring
- chart-heavy personal pages error boundary
```

---

## Adoption recommendation

Recommended rollout order:
1. Add this proposal to architecture docs
2. Update the STATUS template to reflect this structure
3. Add a rule that mode switch must archive `last_cycle` and reset `assignments`
4. Notify Agent 2 and Agent 3 after the repository rule is written

---

## One-line summary

> STATUS should be split into `system + roles + assignments + last_cycle`, so that previous-mode task state does not corrupt the current mode's live interpretation.
