# TASK-032 Report — Boundary Alignment Contract

**Agent:** 2
**Date:** 2026-03-31 13:05 UTC / 21:05 CST
**Batch:** M1 skeleton + boundary alignment

---

## 1. Final Boundary Decisions

### Decision 1: `dispatch/` complements `20_tasks/`; does NOT replace it

**Rationale:**

| Level | What | Who manages |
|---|---|---|
| **Control plane** (`dispatch/`) | Work-packet lifecycle: inbox → active → done | Agent 1 dispatches, Agent 1 closes |
| **Business repo** (`20_tasks/`) | Task trees, checklists, test plans, execution details | Agent 1 decomposes, Agent 2 executes |

The control-plane `dispatch/` is a **routing table** — it says "what should be worked on next." The business-repo `20_tasks/` is an **implementation dossier** — it says "exactly how to do it." They operate at different abstraction levels. Removing `20_tasks/` would force every agent to look in the control-plane repo for implementation details, creating unnecessary cross-repo reads during execution.

**Path mapping:**

```
Control plane                 Business repo (current)
──────────────────────────    ──────────────────────────
dispatch/inbox/ITEM-032.md →  (Agent 1 creates this when dispatching)
dispatch/active/ITEM-032.md → Agent 1 moves here when Agent 2 starts
dispatch/done/ITEM-032.md   → Agent 1 moves here after Agent 3 approval

                              ←→ Agent 1 creates/updates in business repo:
                              20_tasks/TASK-032/task-card.md
                              20_tasks/TASK-032/execution-checklist.md
                              20_tasks/TASK-032/test-plan.md

                              ←→ Agent 2 writes in business repo:
                              30_execution/TASK-032-report.md
                              30_execution/STATUS-REPORT.md
                              30_execution/HANDOFF.md

                              ←→ Agent 3 writes in business repo:
                              40_review/TASK-032-review-YYYYMMDD.md
```

### Decision 2: Single source of truth for role definitions

**Chosen:** Control-plane `agents/*/ROLE.md` is the **source of truth**.

Business-repo `AGENTS.md` becomes a **derived copy** (written by Agent 1 or a script after any role change).

**Why:** If roles diverge across repos, agents act on stale instructions. One file must be canonical. The control-plane repo is the natural home because it's the only repo that all agents share unconditionally.

**Migration path:**
- Step 1: Control-plane ROLE.md is created from current AGENTS.md content
- Step 2: Business-repo AGENTS.md gets a header: `<!-- Source: control-plane agents/*/ROLE.md -->`
- Step 3: A sync step in the dispatch workflow copies role changes to the business repo

### Decision 3: Human-verification artifacts belong in the business repo

**Chosen:** `40_review/` stays in the business repo.

**Rationale:** Human-verification artifacts are about code-level quality (does it compile? are the interfaces correct?). They belong next to the code they review. The control-plane STATUS.md can reference them by path (e.g., `review: 40_review/TASK-032-review-20260331.md`), but the content stays in the business repo.

### Decision 4: Batch metadata and STATUS remain separate

**Chosen:** Control-plane `STATUS.md` is the runtime heartbeat. Business-repo `STATUS.md` is the execution ledger.

They share the YAML front-matter format (from TASK-031B template T1), but serve different audiences:

| File | Audience | Purpose |
|---|---|---|
| Control-plane `STATUS.md` | Agent 1 (dispatch coordination) | What's in the pipeline? Who's doing what? |
| Business-repo `STATUS.md` | Agent 2/3 (execution) | What's the current task? Last commit? Build status? |

---

## 2. Path-Mapping Table

| Control-plane concept | Business-repo path | Relationship |
|---|---|---|
| `config/agents.yaml` | — | Defines agent IDs, roles, workspaces |
| `agents/agent1/ROLE.md` | `AGENTS.md` (derived) | Single source of truth → derived copy |
| `agents/agent2/ROLE.md` | `AGENTS.md` (derived) | Single source of truth → derived copy |
| `agents/agent3/ROLE.md` | `AGENTS.md` (derived) | Single source of truth → derived copy |
| `dispatch/inbox/` | — | Agent 1 places work items here |
| `dispatch/active/` | — | Agent 1 moves items when execution starts |
| `dispatch/done/` | — | Agent 1 moves items after review |
| `status/STATUS.md` | `STATUS.md` (separate) | Runtime heartbeat vs execution ledger |
| `review/` | `40_review/` | CP = "what's pending review"; BR = actual review content |
| `memory/agent1/` | `memory/agent1/` (synced) | Same content, potentially mirrored |
| `memory/agent2/` | `memory/agent2/` (synced) | Same content, potentially mirrored |
| `memory/agent3/` | `memory/agent3/` (synced) | Same content, potentially mirrored |
| `docs/operating-model.md` | `docs/OPERATING-MODEL.md` | Source of truth in CP, copied to BR |
| `docs/memory-model.md` | `docs/MEMORY-MODEL.md` | Source of truth in CP, copied to BR |
| `dispatch/inbox/ITEM-032.md` | `20_tasks/TASK-032/` | Packet = "what to do"; dossier = "how to do it" |

---

## 3. Source-of-Truth Rule

> **The control-plane repo is the single source of truth for:**
> - Agent roles and capabilities
> - Runtime status heartbeat
> - Operating model and memory model
> - Work-packet lifecycle (dispatch → active → done)
>
> **The business repo is the single source of truth for:**
> - Task implementation details (checklists, test plans)
> - Execution artifacts (scripts, schemas, UI code)
> - Review reports and audit trails
> - Actual code and config

**Conflict resolution:** If the two repos disagree on a concept (e.g., "what does Agent 2 do?"), the control-plane repo wins. The business repo's role declarations are copies that may lag by one dispatch cycle.

---

## 4. Migration Notes

1. **No breaking changes** — the current workflow works fine during migration. The control plane is additive.
2. **First real dispatch** — Agent 1 picks a small task, creates a `dispatch/inbox/` item, moves it through the lifecycle. Observe what breaks.
3. **Memory sync** — for M1, memory stays in the business repo. Control-plane `memory/` directories are created but not actively written. Full sync is an M2 concern.
4. **STATUS format** — TASK-031B's YAML front-matter format is adopted immediately. Both repos' STATUS.md files start using it.

---

## 5. Open Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Two repos drifting out of sync on role definitions | MEDIUM | Write a sync script (M2); for M1, rely on discipline |
| Cross-repo reads slow down Agent 2 execution | LOW | Agent 2 only needs business-repo files during execution |
| `dispatch/` adds overhead without benefit for simple batches | LOW | Allow Agent 1 to skip `dispatch/` for single-task micro-batches |
| CONTROL-PLANE REPO DOESN'T EXIST YET | HIGH | This contract is a spec, not an implementation. Agent 1 must create the repo before any real dispatch through it. |

---

## Acceptance checklist

- [x] Final boundary decisions documented (4 decisions)
- [x] Path-mapping table with 15 rows
- [x] Source-of-truth rule stated explicitly
- [x] Migration notes with safe path
- [x] Open risks listed with mitigations
