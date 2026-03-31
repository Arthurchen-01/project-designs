# TASK-031A Report — Control-plane Repo Skeleton

**Task:** TASK-031A — Control-plane repo directory/file map  
**Agent:** 2  
**Date:** 2026-03-31T12:35+08:00

---

## Proposed Directory Structure

```
control-plane/
├── README.md                       # Overview, quickstart, architecture summary
├── config/
│   ├── agents.yaml                 # Agent definitions (roles, models, tools, constraints)
│   ├── rules.yaml                  # Global workflow rules (hearthbeat, git, commit conventions)
│   ├── models.json                 # Provider configs, API keys, model list
│   └── channels.yaml               # Messaging channels (Feishu, Discord, etc.)
├── status/
│   ├── STATUS.md                   # Global project status
│   └── memory/
│       ├── agent-1/               # Agent 1 mid/long-term memory
│       ├── agent-2/               # Agent 2 mid/long-term memory
│       └── agent-3/               # Agent 3 mid/long-term memory
├── dispatch/
│   ├── README.md                   # How dispatch works
│   ├── templates/                  # Task card, execution checklist, test plan templates
│   │   ├── task-card.md
│   │   ├── execution-checklist.md
│   │   └── test-plan.md
│   └── rules.yaml                  # Dispatch-specific rules (priority, assignment, blocking)
├── review/
│   ├── README.md                   # How review works
│   └── templates/
│       ├── review-report.md
│       └── baseline-review.md
├── docs/
│   ├── operating-model.md          # Roles, responsibilities, write scope, constraints
│   ├── memory-model.md             # Short/mid/long-term memory design
│   ├── reading-order.md            # Which files each agent should read on startup
│   └── human-verification.md       # Configurable human-verification points
├── agents/
│   ├── agent-1/
│   │   ├── ROLE.md                 # Agent 1 role definition (canonical source of truth)
│   │   ├── AGENTS.md               # Agent 1 workflow instructions
│   │   └── MEMORY.md               # Agent 1 memory file
│   ├── agent-2/
│   │   ├── ROLE.md
│   │   ├── AGENTS.md
│   │   └── MEMORY.md
│   └── agent-3/
│       ├── ROLE.md
│       ├── AGENTS.md
│       └── MEMORY.md
└── .gitignore
```

## Directory Purposes

| Directory | Purpose | M1 Mandatory? |
|-----------|---------|:-------------:|
| `config/` | Global configs, agent definitions, model/providers, channels | ✅ |
| `status/` | Single source of truth for project state | ✅ |
| `status/memory/` | Agent-specific memory directories | ✅ |
| `dispatch/` | Task dispatch templates, rules, workflow | ✅ |
| `review/` | Review templates, process docs | ✅ |
| `docs/` | Operating model, memory model, verification points | ✅ |
| `agents/` | Per-agent role definitions (single source of truth) | ✅ |

## Mandatory M1 Files

| File | What it defines | Which agent maintains it? |
|------|----------------|--------------------------|
| `config/agents.yaml` | Agent capabilities, models, constraints | Agent 1 (or human) |
| `config/rules.yaml` | Global workflow rules | Agent 1 (or human) |
| `config/models.json` | API keys, model list | Human |
| `config/channels.yaml` | Messaging channels | Human |
| `status/STATUS.md` | Project state | Agent 1 (or human) |
| `agents/agent-*/ROLE.md` | Agent role (source of truth) | Human or Agent 1 |
| `agents/agent-*/AGENTS.md` | Agent workflow instructions | Agent 1 |
| `agents/agent-*/MEMORY.md` | Agent memory | Agent 2/3 (self) |
| `dispatch/templates/task-card.md` | Task card template | Agent 1 |
| `dispatch/templates/execution-checklist.md` | Checklist template | Agent 1 |
| `dispatch/templates/test-plan.md` | Test plan template | Agent 1 |
| `review/templates/review-report.md` | Review report template | Agent 1 |
| `docs/operating-model.md` | Roles, write scope, constraints | Agent 1 |
| `docs/memory-model.md` | Memory layer design | Agent 1 |
| `docs/reading-order.md` | What each agent reads on startup | Agent 1 |
| `docs/human-verification.md` | Verification points config | Human |

## Control Repo vs Business Repo Separation

| Concern | Control Plane | Business Repo (e.g. ap-tracker) |
|---------|--------------|----------------------------------|
| Role definitions | `agents/agent-*/ROLE.md` (canonical) | `AGENTS.md` (synced copy) |
| Workflow rules | `config/rules.yaml` (canonical) | `system/workflow-rules.md` (synced copy) |
| Dispatch templates | `dispatch/templates/` | `20_tasks/` (per-project) |
| Review templates | `review/templates/` | `40_review/` (per-project) |
| Status | `status/STATUS.md` (global) | `STATUS.md` (per-project) |
| Memory | `status/memory/agent-*/` (global) | `memory/agent-*/` (per-project) |
| Execution reports | — | `30_execution/` (per-project) |
| Source code | — | per-project repos |
| Input files | — | `00_input/` (per-project) |
| Architecture | — | `10_architecture/` (per-project) |

**Key principle:** The control plane defines WHO (roles, models, rules) and HOW (templates, workflows). The business repo contains WHAT (input, execution, output, source code).

## Source of Truth Decision

For role definitions, `agents/agent-*/ROLE.md` in the control repo is the canonical source of truth. The business repo's `AGENTS.md` is a synced copy that agents read locally. When the control repo updates a role, a sync mechanism copies it to all active business repos.

For workflow rules, `config/rules.yaml` is the single source of truth. Business repos have `system/workflow-rules.md` as a human-readable rendering.

## Report Back

- ✅ Top-level directories defined: 7 directories
- ✅ Purpose of each directory documented
- ✅ Mandatory M1 files: 15 files across 7 directories
- ✅ Clear separation between control repo (roles, rules, models, templates) and business repo (input, execution, output, code)
- ✅ Source of truth: `agents/agent-*/ROLE.md` for roles, `config/rules.yaml` for workflow rules
- 📄 Written to: `30_execution/TASK-031A-report.md`
