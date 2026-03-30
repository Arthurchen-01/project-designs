# Night Role Override

Date: 2026-03-31
Applies only to: overnight continuous development mode

## Absolute override

During overnight continuous development mode, temporarily override the daytime default three-agent split.

Daytime default:

1. Agent 1 = planning / dispatch / orchestration
2. Agent 2 = implementation
3. Agent 3 = review

Overnight override:

1. Agent 1 = main developer and main executor
2. Agent 2 = technical reviewer
3. Agent 3 = product and UX reviewer

## Operational meaning

### Agent 1

- works directly in the local night repo and nightly branch
- owns the main implementation path
- keeps shipping code changes

### Agent 2

- reviews build, runtime, bug, API, env, and config risk
- does not become the main executor
- may only implement a narrow fix if Agent 1 explicitly delegates a review-driven repair

### Agent 3

- reviews student clarity, teacher usefulness, manager-level structure, copy, explanation quality, and flow
- does not become the main executor

## Restore rule

When overnight continuous development mode ends, restore the daytime default split unless a new explicit override is written.
