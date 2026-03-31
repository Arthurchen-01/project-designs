# Architecture Brief — Multi-Agent Productization Direction

## Purpose
Translate the newly provided productization package into a realistic repository-driven build path.

This brief does **not** replace the whole current system state.
It defines a new controlled workstream for productizing the collaboration system itself.

---

## 1. Problem framing

Current multi-agent collaboration exists, but it is still partly convention-based:
- mode definitions are not fully productized
- state semantics can be misleading across mode switches
- handoff is partially documented but not standardized
- user-visible verification is weak
- current working practice is stronger than current formal system design

The goal is to convert that reality into a reusable control system.

---

## 2. Architectural direction

### 2.1 System scope
Treat the collaboration system as its own product.
It should become a dedicated control-plane style system with:
- configuration
- role/mode definitions
- task lifecycle structures
- handoff/read-order protocol
- human verification protocol
- structured status model

### 2.2 First implementation principle
Do not try to build the entire 9-mode theoretical matrix first.
Instead, formalize the most real and useful path:
- default practical path = dual-server hybrid
- repository-first coordination
- human-readable + machine-readable status
- small number of mandatory runbooks and templates

### 2.3 Facts and status model
Adopt the proposed direction:
- facts root = events + execution/review reports + task state
- status snapshot = derived
- STATUS structure direction = `system + roles + assignments + last_cycle`

### 2.4 Human verification requirement
Every completed batch should become explainable to a human:
- what changed
- whether it is user-visible
- where to check
- what remains invisible but important

This is a first-class product requirement, not a nice-to-have.

---

## 3. Recommended first milestone

### Milestone M1 — Control Plane Skeleton + Rules
The first milestone should formalize the collaboration system skeleton before runtime complexity.

Scope:
1. repository structure direction for control-plane system
2. status/facts model
3. handoff protocol
4. reading-order protocol
5. human verification protocol
6. first small task packets for implementation

Not in M1:
- full runtime orchestration
- full failover engine
- full dashboard/web UI
- all 9 modes fully implemented

---

## 4. Dispatch principle for the first batch

Agent2 should not be given “build the whole system”.
Agent2 should receive a very small delivery batch, such as:
- create minimal control-repo skeleton spec files or templates
- draft structured status template
- draft handoff/read-order/human-verification templates

Agent3 should review:
- whether the packet is small enough
- whether the templates are unambiguous
- whether the human verification requirement is actually represented

---

## 5. Recommended first-batch tasks

### TASK-PROD-001
Formalize the control-plane repository skeleton and baseline file map.

### TASK-PROD-002
Formalize the structured STATUS model and derived STATUS.md rendering rules.

### TASK-PROD-003
Formalize handoff + reading-order + human-verification templates.

These three tasks are enough to start without creating open-ended execution drift.

---

## 6. Success condition for the first batch

The first batch is successful if:
1. repository input is captured
2. architecture direction is documented
3. task packets are small and checkable
4. Agent2 can execute without guessing system scope
5. Agent3 can review against explicit structure and acceptance points

---

## One-line summary

Do not productize the entire system in one jump.
First formalize the skeleton: facts model, status model, handoff model, verification model, and small implementation packets.
