# Overnight Autonomy Design - 2026-03-31

## Goal

Turn the current three-agent workflow into a bounded overnight execution system that can continue for 4 to 7 hours with limited human supervision and still produce a reliable morning result package.

This design is not "full unsupervised AGI". It is a constrained automation loop with:

- strict input contracts
- bounded task batches
- allowed self-healing actions
- explicit stop rules
- mandatory morning output

## What Success Looks Like

By morning, the system should be able to produce one of three outcomes:

1. `COMPLETE`
   A planned batch finished, reports and review are written, and the user can inspect a compact morning summary.
2. `PARTIAL_WITH_VALUE`
   Some tasks completed, blockers are explicit, and the next smallest step is already prepared.
3. `BLOCKED_WITH_EXPLANATION`
   The system stopped itself for a valid reason and wrote a blocker report instead of silently stalling.

Silent failure is not an acceptable outcome.

## Non-Goals

- Do not assume every vague requirement can be solved overnight.
- Do not let agents improvise broad product direction without a written master spec.
- Do not allow destructive repository recovery by default.
- Do not require the user to read long chat logs to know what happened.

## Current Reality in This Project

Using the current `project-designs` workflow as the example, the real overnight failure modes already observed are:

- model/provider calls can fail repeatedly
- an agent can finish work locally but fail to push
- local GitHub TLS can fail on one machine while another machine can still push
- status files can lag behind repository truth
- dependent tasks can be split too early and cause design overlap

This means the overnight system must optimize for recovery and visibility, not just raw execution.

## Operating Model

### Roles

- Agent 1: supervisor, dispatcher, consolidator, and fallback publisher
- Agent 2: main executor for the current batch
- Agent 3: reviewer or follow-up template/starter-pack worker, only when the dependency graph allows it

### Sources of Truth

Priority order:

1. latest repository `HEAD`
2. task reports in `30_execution/`
3. review reports in `40_review/`
4. `STATUS.md`
5. chat

If it is not written back into the repository, it does not count as finished.

## Input Contract

The system should never be fed only a huge free-form wall of text.

It should always receive:

1. one stable master spec
2. one active overnight batch brief
3. one or more task cards with acceptance criteria

### Master Spec

The master spec is the long document. It may be very detailed, but it must be structured.

It should contain:

- objective
- hard constraints
- priority order
- success criteria
- explicit non-goals
- source files and canonical references

### Batch Brief

The batch brief is the overnight slice. It answers:

- what this night is trying to finish
- what is out of scope
- what the stop conditions are
- which tasks can run in parallel
- which tasks must wait

## Overnight Loop

### Phase 1: preflight

Before entering the overnight loop, Agent 1 must confirm:

- all three workspaces are reachable
- the branch of record is correct
- the current batch brief exists
- the active task cards exist
- the previous batch is closed or explicitly archived

If preflight fails, do not start the night run.

### Phase 2: dispatch

Agent 1 writes:

- updated `STATUS.md`
- the current task cards
- any architecture notes needed for this batch

Only then does execution begin.

### Phase 3: execution

Agent 2 works the active execution packet.

Agent 3 is used only if:

- the task is review-ready
- or the next work item is independent

Do not parallelize dependent tasks just to keep every machine busy.

### Phase 4: health loop

Every heartbeat cycle, Agent 1 or the supervisor logic checks:

- did `HEAD` change
- did `STATUS.md` change
- did a new file appear in `30_execution/` or `40_review/`
- is any agent `ahead` with unpushed work
- is any agent stuck on repeated provider or push failure

### Phase 5: morning pack

At the end of the window, the system must produce:

- a result summary
- completed tasks
- blocked tasks
- changed files
- user-visible vs invisible changes
- next recommended batch

## Self-Healing Policy

Allowed automatic recovery actions:

- retry provider calls with bounded backoff
- `git fetch`
- `git pull --ff-only` when clean
- retry `git push`
- if one machine cannot push but another can, relay the commit through another machine
- update stale `STATUS.md` after repository truth is known
- mark a task `BLOCKED` if retries exceed threshold

Not allowed automatically:

- force push
- `git reset --hard`
- deleting runtime services
- changing machine user model
- rewriting secrets or provider configuration without explicit user instruction

## Stuck Detection

A task should be considered stuck when any of the following is true:

- no new commit, report, or review appears for 20 minutes
- the same provider failure repeats 3 or more times
- an agent finishes work locally but still has not pushed after retry budget is exhausted
- `STATUS.md` points at a task but the repository has no corresponding task output after the expected window

When stuck, the system must do one of two things:

1. recover automatically using the allowed actions
2. write a blocker report and stop pretending the task is still running

## Recommended 7-Hour Pattern

For a real overnight run, do not schedule one giant task.

Use four bounded waves:

1. Wave A: boundary decisions and architecture alignment
2. Wave B: starter-pack or implementation packet
3. Wave C: review and repair
4. Wave D: morning result pack and next-batch preparation

## Current Project Example

For this control-plane productization project, the correct overnight sequence is:

1. master spec: multi-agent productization goal
2. batch brief: tonight only solve boundary alignment and starter-pack direction
3. task packet:
   - `TASK-032`: boundary alignment contract
   - `TASK-033`: starter pack, but only after `TASK-032`
4. morning pack:
   - whether the control-plane boundary is now explicit
   - whether starter files can be scaffolded next
   - what is blocked

This is a good overnight batch because:

- it is valuable even if only partially complete
- it has clear reviewable outputs
- it avoids pretending the entire system can be "finished" in one night

## Design Rule

The overnight system should optimize for:

- no silent stalls
- no hidden work
- no fake completion
- no dependency confusion

If those four are protected, sleeping through a 7-hour batch becomes realistic for bounded work.
