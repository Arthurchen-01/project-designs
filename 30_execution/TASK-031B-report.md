# TASK-031B Report — M1 Baseline Templates and Protocol Set

**Agent:** Agent 3
**Date:** 2026-03-31
**Task:** Define the minimum template/protocol set required for M1 control-plane usability.

---

## 1. Template Set Overview

The minimum viable template set for M1 consists of **4 templates + 1 protocol rule**:

| # | Template | Purpose | Format |
|---|----------|---------|--------|
| T1 | STATUS template | Unified agent state snapshot | YAML front-matter + derived Markdown |
| T2 | Handoff template | Cross-agent work transfer | Markdown with structured sections |
| T3 | Reading-order template | Deterministic intake sequence for new agents | Markdown checklist |
| T4 | Human-verification template | Make batch results explainable to humans | Markdown with fixed section set |
| P1 | Protocol: no-hidden-context rule | All coordination must go through repository, not chat | Convention/rule |

### Why these five and not more

- **T1 (STATUS)** is the single source of truth for "what is each agent doing right now" — without it, every agent re-reads the entire repo to guess state.
- **T2 (Handoff)** is how Agent 1 tells Agent 2 what to do next, and how Agent 2 tells Agent 1 what happened — without it, work drifts into chat.
- **T3 (Reading-order)** is how a cold-start agent (or a human) knows what to read first — without it, agents waste cycles figuring out where to start.
- **T4 (Human-verification)** is how the user understands what changed without reading code diffs — without it, trust erodes.
- **P1 (No-hidden-context)** is the meta-rule that makes T1–T4 actually useful. If coordination happens in chat, templates become stale.

---

## 2. Template Specifications

### T1: STATUS Template

Based on the STATUS-structure-proposal.md four-layer model.

**File:** `STATUS.md` (repository root)

```yaml
---
system:
  current_mode: DAY_INTERACTIVE | NIGHT_CONTINUOUS | MAINTENANCE
  current_phase: PLANNING | EXECUTING | REVIEWING | IDLE
  capacity_mode: FULL_3 | FALLBACK_2 | SOLO_1
  active_project: <string>
  branch_of_record: <branch>
  last_updated: <ISO8601>
  last_updated_by: agent<N>

roles:
  agent1:
    role: PLANNER | DEVELOPER
    responsibility: <string>
  agent2:
    role: EXECUTOR | TECH_REVIEW
    responsibility: <string>
  agent3:
    role: REVIEWER | PRODUCT_REVIEW
    responsibility: <string>

assignments:
  agent1:
    state: PLANNING | EXECUTING | REVIEWING | IDLE
    current_task: TASK-XXX | null
    current_focus: <string>
  agent2:
    state: <same enum>
    current_task: TASK-XXX | null
    current_focus: <string>
  agent3:
    state: <same enum>
    current_task: TASK-XXX | null
    current_focus: <string>

last_cycle:
  mode: <previous mode>
  batch: <batch id>
  result: COMPLETE | PARTIAL | FAILED
  closed_tasks: [TASK-XXX, ...]
  review_status: PASS | REWORK | PENDING

next_candidates:
  - <string>
```

**Derived Markdown rendering** should be auto-generated or manually written in a consistent format (see STATUS-structure-proposal.md section "Markdown STATUS rendering suggestion").

**Key rules:**
- On mode switch: archive to `last_cycle`, reset `assignments`, update `roles`
- Previous-mode task state must NOT remain in current `assignments`

---

### T2: Handoff Template

**File:** `30_execution/HANDOFF.md`

```markdown
# Handoff — [date]

## From
- Agent: <N>
- Task: TASK-XXX
- Status: DONE | PARTIAL | BLOCKED

## Summary
<1-3 sentences: what was done>

## Changed files
- path/to/file1 — what changed
- path/to/file2 — what changed

## Verification
- [ ] <how to check it works>
- [ ] <build passes>
- [ ] <API responds correctly>

## Blockers (if any)
<what's blocking, what Agent 1 should decide>

## Next recommended step
<smallest useful next action for Agent 2>
```

**Key rules:**
- Must include changed files list (reviewers can't review without it)
- Must include verification checklist (not just "trust me")
- Must state next step recommendation (Agent 1 decides, but Agent 2 proposes)

---

### T3: Reading-Order Template

**Purpose:** A cold-start agent or human should be able to follow this without guessing.

**File:** `system/reading-order.md` (or inline in AGENTS.md)

```markdown
# Reading Order

## Cold start (new agent, new machine)
1. AGENTS.md — role detection
2. SOUL.md — persona and working style
3. STATUS.md — current mode, roles, assignments
4. system/workflow-rules.md — coordination rules
5. system/naming-rules.md — file naming conventions
6. docs/OPERATING-MODEL.md — if present
7. 30_execution/HANDOFF.md — latest handoff
8. 30_execution/STATUS-REPORT.md — latest status report
9. 40_review/<latest> — latest review verdict

## Pre-task execution (Agent 2)
1. STATUS.md — confirm your assignment
2. 20_tasks/TASK-XXX/task-card.md — what to do
3. 20_tasks/TASK-XXX/execution-checklist.md — step-by-step
4. 20_tasks/TASK-XXX/test-plan.md — how to verify
5. 10_architecture/ — relevant context
6. 00_input/ — original requirements

## Pre-review (Agent 3)
1. STATUS.md — find PENDING review target
2. 20_tasks/TASK-XXX/task-card.md — acceptance criteria
3. 20_tasks/TASK-XXX/test-plan.md — pass criteria
4. 30_execution/TASK-XXX-report.md — execution output
5. 30_execution/HANDOFF.md — latest handoff
6. 30_execution/STATUS-REPORT.md — latest status
```

**Key rules:**
- Reading order is deterministic, not "browse around until you understand"
- Each step maps to a concrete file
- Different roles have different reading orders

---

### T4: Human-Verification Template

**Purpose:** After a batch completes, produce a human-readable summary so the user can verify without reading code.

**File:** `40_review/TASK-XXX-verification.md` (or appended to review report)

```markdown
# Human Verification — TASK-XXX

## What changed
<plain-language description, no jargon>

## Is it user-visible?
- [ ] Yes — <where to see it>
- [ ] No — internal change only

## How to verify
1. <specific action, e.g., "open /classId/daily-update, submit a test update">
2. <what to look for, e.g., "fields should appear correctly in the API response">
3. <pass criteria, e.g., "no 400 error, data persists">

## What remains invisible but important
<e.g., "API now accepts both old and new field names for backward compatibility">

## Risk level
- [ ] Low — cosmetic or additive
- [ ] Medium — changed existing behavior
- [ ] High — changed data flow or auth
```

**Key rules:**
- "Is it user-visible?" is mandatory — this is the user's primary question
- "How to verify" must be actionable, not vague ("check it works")
- "What remains invisible" catches things the user would never notice but should know

---

### P1: Protocol — No Hidden Context Rule

**Rule:** All inter-agent coordination must go through repository files. Chat is for status notifications and human interaction only.

**Specifics:**
- Agent 1 dispatches work via `20_tasks/TASK-XXX/`, not chat messages
- Agent 2 reports via `30_execution/HANDOFF.md` + `STATUS-REPORT.md`, not chat
- Agent 3 reviews via `40_review/TASK-XXX-review-YYYYMMDD.md`, not chat
- STATUS.md is the single coordination signal — if it's not in STATUS.md, it didn't happen
- If a chat message contains work instructions, the receiving agent must request it be written to the repo first

**Why this is a protocol, not a template:** Templates are files. This is a behavioral constraint that makes the templates trustworthy. Without it, agents coordinate in chat, templates go stale, and handoff breaks.

---

## 3. Why These Are the Minimum Viable Set

**What's excluded and why:**

| Excluded item | Why not in M1 |
|---------------|---------------|
| Runtime orchestration template | Not needed until we have >3 agents or auto-failover |
| Dashboard/Web UI | Human-verification template covers the need for now |
| Full 9-mode matrix | We only use 3 modes today; template should be mode-agnostic |
| Git hooks / CI templates | Can be added after M1 skeleton proves useful |
| Notification routing templates | STATUS.md + handoff covers current notification needs |

**Minimum = what prevents the most common failure modes:**
1. Agent doesn't know what to do → T3 reading-order fixes this
2. Agent doesn't report what it did → T2 handoff fixes this
3. Human can't understand what changed → T4 human-verification fixes this
4. Mode switch corrupts state → T1 STATUS with four-layer model fixes this
5. Agents coordinate in chat → P1 no-hidden-context rule fixes this

---

## 4. Human Verification Coverage

Each template maps to a human verification need:

| Human question | Template that answers it |
|----------------|-------------------------|
| "What is each agent doing right now?" | T1 STATUS |
| "What did Agent 2 just finish?" | T2 Handoff |
| "Where do I start if I'm new?" | T3 Reading-order |
| "Did the latest batch actually work?" | T4 Human-verification |
| "Is everything in the repo or scattered in chat?" | P1 Protocol |

The user can always answer "what happened?" by reading:
1. STATUS.md (current state)
2. Latest HANDOFF.md (what just finished)
3. Latest human-verification (can I trust it?)

---

## 5. Open Questions / Risks

1. **STATUS rendering automation:** The four-layer YAML model is clean, but manually maintaining both YAML and Markdown is error-prone. M1 should accept manual maintenance; M2 should add a render script.

2. **Human-verification adoption:** Agents may skip T4 if not enforced. Recommendation: add "human-verification written?" to the execution checklist for every task.

3. **Reading-order drift:** If file locations change, T3 breaks. Recommendation: T3 references logical paths, not literal paths, and is checked during architecture updates.

4. **Protocol enforcement:** P1 (no-hidden-context) is a social contract. There's no automated way to prevent chat-based coordination. Mitigation: if STATUS.md and HANDOFF.md are always up-to-date, chat drift is visible.

5. **Template versioning:** These templates will evolve. M1 should include a version field or at minimum a "last updated" date in each template header.
