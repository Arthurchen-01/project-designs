# Operating Model

This repository runs as a shared runtime bus for three OpenClaw instances.

## Control flow

1. User talks to Agent 1 in Feishu.
2. Agent 1 records or updates structured input in `00_input/`.
3. Agent 1 writes strategy to `10_architecture/` and dispatch packets to `20_tasks/`.
4. Agent 2 executes the smallest current step and writes outputs to `30_execution/`.
5. Agent 3 audits the batch and writes review output to `40_review/`.
6. Agent 1 decides the next smallest step.

## Single-Feishu-group rule

- Agent 1 is the only intake endpoint for new work.
- Agent 2 and Agent 3 may reply with status, but must not accept new scope directly from chat.
- Repository state is the coordination layer; Feishu is only the user-facing transport.

## Batch ID rule

Use a shared batch identifier such as:

- `M01-S01-R01`
- `M01-S01-R02`
- `M01-S02-R01`

Agent 1 assigns it, Agent 2 and Agent 3 reuse it.
