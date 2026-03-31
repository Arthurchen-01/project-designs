# Requirement Input — 2026-03-31 Multi-Agent Productization Direction

## Source
User-provided productization input package based on the following files:
1. Desktop/AI brain storming/我那724的团队/多Agent协同系统-PRD正式版.md
2. Desktop/AI brain storming/我那724的团队/多Agent协同系统-研发任务清单.md
3. Desktop/AI brain storming/我那724的团队/STATUS-结构改造方案.md
4. Desktop/AI brain storming/我那724的团队/通知Agent2和3的话术.md

## Important instruction from user
This is a **new productization direction input package**.
It is **not** an instruction to directly overwrite all current system state.

## Structured requirement summary

### A. Product direction
Build a reusable multi-agent collaboration control system rather than continuing to treat the current setup as an ad-hoc set of cooperating agents.

The target system should be:
- runbook-driven
- mode-aware
- switchable between auto/manual/hybrid
- switchable between full_3/fallback_2/solo_1
- controllable via a dedicated control repo (`only-for-env` direction)
- understandable and verifiable by humans
- easy for new AI / new machines to hand off into

### B. Core goals
1. Formalize control modes and capacity modes
2. Build a proper facts/status model
3. Formalize handoff and reading order
4. Add human-verification outputs so changes are understandable to the user
5. Avoid freeform agent improvisation when runbooks/checklists exist
6. Prefer a minimal real working path over complete theoretical coverage

### C. Current productization decisions / biases
- Control repo direction: `only-for-env`
- First practical path: dual-server hybrid should run stably first
- Web console is not first priority
- Git is persistence/config/audit center, not real-time queue/database
- STATUS should evolve into a structured model (`system + roles + assignments + last_cycle`)
- Notification to other agents should be repository-first, chat-second

### D. Constraints
- Do not let Agent2 or Agent3 freestyle from this package
- Agent1 must first convert this into architecture + concrete task packets
- Prefer small, checkable first tasks over a huge open-ended build order
- This input package should coexist with current repository workflow rather than wipe it out

### E. Priority interpretation
Immediate next step is not “build everything”.
Immediate next step is:
1. capture the direction in repository input
2. write a concise architecture brief
3. define the minimum first batch of work
4. dispatch only the smallest useful packet

## Expected outputs from Agent1
1. structured input record in `00_input/`
2. architecture brief in `10_architecture/`
3. executable task packets in `20_tasks/`
4. recommendation to user: execution order + minimum first batch
