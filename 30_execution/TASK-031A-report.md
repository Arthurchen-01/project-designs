# TASK-031A Report — Control-plane repo skeleton (directory/file map)

**Agent:** 2
**Date:** 2026-03-31 18:40 CST
**Batch:** DAY-2026-03-31-S02

---

## 1. Proposed structure

```
agent-control-plane/              # Root: the control-plane repo
├── README.md                     # Purpose, quick-start, ownership
├── config/
│   ├── agents.yaml               # Agent registry (id, role, workspace, model)
│   └── rules.yaml                # Global rules: write-boundaries, chat routing, heartbeat cadence
├── agents/                       # One subdirectory per registered agent
│   ├── agent1/
│   │   └── ROLE.md               # Role declaration (as written in workspace AGENTS.md)
│   ├── agent2/
│   │   └── ROLE.md
│   └── agent3/
│       └── ROLE.md
├── dispatch/
│   ├── inbox/                    # Incoming work items (file-per-item, dropped by Agent 1 or external)
│   ├── active/                   # Currently dispatched (moved here by Agent 1)
│   └── done/                     # Completed items (moved here by Agent 1 after review)
├── status/
│   └── STATUS.md                 # Single aggregated runtime state file
├── review/
│   └── .gitkeep                  # Agent 3 writes review packets here
├── memory/
│   ├── agent1/
│   ├── agent2/
│   └── agent3/
└── docs/
    ├── operating-model.md        # Control-flow rules, batch-ID convention
    └── memory-model.md           # Short/mid/long term layer spec
```

---

## 2. Why this split is minimal

- **7 top-level directories** — each maps to exactly one concern (config, agents, dispatch, status, review, memory, docs).
- **No business logic** — this repo does not contain application code. It is purely coordination scaffolding.
- **No protocol files** — handoff/verification protocol semantics belong to TASK-031B (baseline templates).
- **No `00_input/`, `10_architecture/`, `20_tasks/`, `30_execution/`, `40_review/`** — those are business-repo layouts managed by the agents themselves. The control plane only dispatches and reads back.
- **`dispatch/` is the new `20_tasks/`** — but at the control-plane level, items are file-based (one YAML or markdown per work packet), not directory trees. The control plane dispatches; agents organize their own task trees inside business repos.

---

## 3. M1 mandatory files

For the first milestone (M1), these files must exist:

| File | Why mandatory at M1 |
|---|---|
| `README.md` | Explains what this repo is and how to use it |
| `config/agents.yaml` | Agent registry — without this, nothing runs |
| `config/rules.yaml` | Write-boundary rules — without this, agents conflict |
| `agents/*/ROLE.md` | Role declaration per agent — mirrors workspace AGENTS.md |
| `status/STATUS.md` | Single source of truth for runtime state |
| `dispatch/inbox/.gitkeep` | Makes the inbox directory exist from day 1 |
| `docs/operating-model.md` | Control-flow rules |
| `docs/memory-model.md` | Memory layer spec |

M1 does NOT require:
- `dispatch/active/` and `dispatch/done/` — these are created on first real dispatch.
- `memory/` directories — created lazily when agents first write memory.
- `review/` — created when Agent 3 writes first review packet.

---

## 4. Open questions / risks

1. **`dispatch/` vs business-repo `20_tasks/`** — the control plane uses `dispatch/inbox → active → done` as a lifecycle pipeline. The business repo still has `20_tasks/` for task trees with checklists. Need to clarify: does `dispatch/` replace `20_tasks/`, or is it a complementary abstraction layer?

2. **`agents/ROLE.md` duplication** — agents already have AGENTS.md in their workspace. Having ROLE.md in the control plane as well means two sources of truth for role definition. Propose: control-plane ROLE.md is the source; workspace AGENTS.md is a symlink or copy.

3. **Write-boundary enforcement** — the control plane can declare write boundaries in `rules.yaml`, but enforcement is manual (agents must comply). No runtime lock. Risk of accidental cross-boundary writes remains.

4. **Config file format** — YAML vs TOML vs JSON. Suggested: YAML for human readability (consistent with existing STATUS.md YAML frontmatter convention).

---

## Acceptance standard

- [x] Clearly defines minimal repo skeleton
- [x] Stays at M1 structure only (no protocol drift)
- [x] Separates control-plane vs business-repo responsibilities
- [x] Specific enough for Agent 1 to dispatch next implementation packet
