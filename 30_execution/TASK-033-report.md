# TASK-033 Report — Repo-ready starter pack from approved M1 contract

**Agent:** 2
**Date:** 2026-03-31 21:15 CST
**Batch:** M1 skeleton + boundary alignment
**Dependency:** TASK-032 (boundary decisions) ✅

---

## 1. Starter file list

| # | File | Source (if reused) | Can scaffold now? |
|---|---|---|---|
| 1 | `README.md` | New | ✅ Yes |
| 2 | `config/agents.yaml` | New (mirrors STATUS.md roles) | ✅ Yes |
| 3 | `config/rules.yaml` | New (from TASK-031A write-boundary table) | ✅ Yes |
| 4 | `status/STATUS.md` | TASK-031B T1 template | ✅ Yes |
| 5 | `docs/operating-model.md` | Reuse `docs/OPERATING-MODEL.md` from business repo | ✅ Yes |
| 6 | `docs/memory-model.md` | Reuse `docs/MEMORY-MODEL.md` from business repo | ✅ Yes |
| 7 | `dispatch/inbox/.gitkeep` | — | ✅ Yes |
| 8 | `dispatch/active/.gitkeep` | — | ✅ Yes |
| 9 | `dispatch/done/.gitkeep` | — | ✅ Yes |
| 10 | `agents/agent1/ROLE.md` | Reuse business-repo AGENTS.md §role agent1 | ✅ Yes |
| 11 | `agents/agent2/ROLE.md` | Reuse business-repo AGENTS.md §role agent2 | ✅ Yes |
| 12 | `agents/agent3/ROLE.md` | Reuse business-repo AGENTS.md §role agent3 | ✅ Yes |
| 13 | `templates/STATUS.md` | TASK-031B T1 template | ✅ Yes |
| 14 | `templates/HANDOFF.md` | TASK-031B T2 template | ✅ Yes |
| 15 | `templates/READING-ORDER.md` | TASK-031B T3 template | ✅ Yes |
| 16 | `templates/HUMAN-VERIFICATION.md` | TASK-031B T4 template | ✅ Yes |
| 17 | `memory/agent1/.gitkeep` | — | ⏸️ Defer (M2 sync concern) |
| 18 | `memory/agent2/.gitkeep` | — | ⏸️ Defer (M2 sync concern) |
| 19 | `memory/agent3/.gitkeep` | — | ⏸️ Defer (M2 sync concern) |
| 20 | `review/.gitkeep` | — | ✅ Yes |
| 21 | `CHECKLIST.md` | New (human-verification pass/fail list) | ✅ Yes |

---

## 2. Content outline for each starter file

### 2.1 `README.md`

```markdown
# agent-control-plane

Multi-agent coordination repository.
Agents: agent1 (dispatch), agent2 (execution), agent3 (review).

## Quick start
1. Read config/agents.yaml for agent roles
2. Read config/rules.yaml for dispatch and boundary rules
3. See status/STATUS.md for current runtime state

## Structure
- config/ — agents.yaml, rules.yaml
- agents/ — ROLE.md per agent
- dispatch/ — inbox → active → done lifecycle
- status/ — runtime heartbeat (STATUS.md)
- review/ — Agent 3 review packets
- templates/ — STATUS, HANDOFF, READING-ORDER, HUMAN-VERIFICATION
- docs/ — operating-model.md, memory-model.md
- memory/ — per-agent memory (M2)
```

### 2.2 `config/agents.yaml`

```yaml
agents:
  - id: agent1
    role: command-center
    workspace: workspace-agent1
    model: openrouter/xiaomi/mimo-v2-pro
    responsibilities:
      - intake
      - planning
      - dispatch
    write_scope:
      - dispatch/
      - status/
      - memory/agent1/

  - id: agent2
    role: executor
    workspace: workspace-agent2
    model: openrouter/xiaomi/mimo-v2-pro
    responsibilities:
      - implementation
      - testing
      - execution reporting
    write_scope:
      - 30_execution/
      - memory/agent2/

  - id: agent3
    role: reviewer
    workspace: workspace-agent3
    model: openrouter/xiaomi/mimo-v2-pro
    responsibilities:
      - code review
      - audit
      - memory hygiene
    write_scope:
      - 40_review/
      - memory/agent3/
```

### 2.3 `config/rules.yaml`

```yaml
# Global dispatch and boundary rules

dispatch:
  lifecycle:
    - stage: inbox
      description: "New work packet, not yet started"
      actor: agent1
    - stage: active
      description: "Currently being executed"
      actor: agent2
    - stage: done
      description: "Completed and reviewed"
      actor: agent3

boundaries:
  - agent: agent1
    writable: ["dispatch/", "status/STATUS.md", "memory/agent1/"]
    forbidden: ["30_execution/", "40_review/"]

  - agent: agent2
    writable: ["30_execution/", "memory/agent2/"]
    forbidden: ["dispatch/", "40_review/", "10_architecture/"]

  - agent: agent3
    writable: ["40_review/", "memory/agent3/"]
    forbidden: ["30_execution/", "dispatch/"]

source_of_truth:
  roles: "agents/*/ROLE.md"  # control-plane is canonical
  operating_model: "docs/operating-model.md"
  memory_model: "docs/memory-model.md"

conflict_resolution:
  rule: "control-plane wins on role definitions"
  override: "business-repo AGENTS.md is a derived copy"
```

### 2.4 `status/STATUS.md`

Uses TASK-031B T1 template format (YAML front-matter + Markdown). Copy the template exactly.

### 2.5 `docs/operating-model.md`

Copy from business-repo `docs/OPERATING-MODEL.md`. Add a header:
```markdown
<!-- Source of truth: this file. Business-repo copy may lag by one dispatch. -->
```

### 2.6 `docs/memory-model.md`

Copy from business-repo `docs/MEMORY-MODEL.md`. Add same header.

### 2.7 `dispatch/` directories

Three `.gitkeep` files for `inbox/`, `active/`, `done/`. Content: empty.

### 2.8 `agents/*/ROLE.md`

Extract role sections from business-repo `AGENTS.md`. One file per agent.

### 2.9 `templates/` files

Copy from TASK-031B report:
- `STATUS.md` — T1 template
- `HANDOFF.md` — T2 template
- `READING-ORDER.md` — T3 template
- `HUMAN-VERIFICATION.md` — T4 template

### 2.10 `review/.gitkeep`

Empty, creates directory.

### 2.11 `CHECKLIST.md`

```markdown
# Human Verification Checklist

For each completed batch:

- [ ] All agent2 task folders closed
- [ ] All agent3 review reports written
- [ ] STATUS.md state matches actual repo state
- [ ] Build passes in business repo
- [ ] No orphaned task directories
- [ ] Memory files updated (short/mid/long)
```

---

## 3. Immediate vs deferred

### Scaffold immediately (M1)
Items 1–16, 20, 21 from the file list. These can be created in one pass from the existing business repo and TASK-031B templates.

### Defer to M2
Items 17–19 (`memory/agent*/.gitkeep`). Memory sync between control-plane and business repo needs a real use case before we add complexity.

---

## Acceptance checklist

- [x] Starter file list with 21 items
- [x] Content outline for each starter file
- [x] Reuse plan (which items reuse TASK-031A/B material)
- [x] Immediate vs deferred split
