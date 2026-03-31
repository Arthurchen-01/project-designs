# TASK-032 Test Plan

## Verification goals
1. The schema separates mode state, role mapping, current assignment state, and archived previous-cycle state
2. The schema avoids the known ambiguity from old top-level agent state fields
3. The Markdown rendering remains readable for humans
4. The template is specific enough for later implementation

## Pass criteria
- A reviewer can explain the difference between `roles` and `assignments`
- A reviewer can explain how `last_cycle` prevents mode-switch confusion
- The schema is small enough to use as a first implementation template
