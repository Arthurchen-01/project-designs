# Master Spec Template

## 1. Objective

What is the end goal in one sentence?

## 2. Morning Success Condition

If the system runs overnight, what should be true by morning?

## 3. Priority Order

List the priorities in strict order.

1. first priority
2. second priority
3. third priority

## 4. Hard Constraints

What the agents must not violate:

- branch rules
- security rules
- data rules
- deployment rules

## 5. Explicit Non-Goals

List what should not be attempted in this batch or this phase.

## 6. Canonical Inputs

Which files are the official sources of truth?

- file/path A
- file/path B
- file/path C

## 7. Acceptance Criteria

How do we know this work is done?

- required output 1
- required output 2
- pass condition 1
- pass condition 2

## 8. Dependency Notes

What must happen first? What cannot run in parallel?

## 9. Allowed Autonomy

What the system may decide on its own:

- retries
- report generation
- batch splitting

## 10. Forbidden Autonomy

What still requires human approval:

- destructive Git recovery
- secrets changes
- environment changes
- production-impacting decisions
