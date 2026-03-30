# Night Continuous Development Brief

Date: 2026-03-31
Owner: Agent 1

## Goal

Switch from single-point trial work to constrained overnight continuous development.

The working code repo is:

- GitHub repo: `https://github.com/Arthurchen-01/ap-tracker.git`
- Branch of record: `nightly/2026-03-31-confidence-fix`

The coordination repo remains this shared three-agent repository.

## User intent

The overnight build should move the AP AI prep site toward a real trial product for:

- students
- teachers
- managers

The work should improve clarity, actionability, flow, and API readiness.

## Priority areas

1. Home / class selection
2. Class dashboard
3. Five-rate detail presentation
4. Personal center
5. Subject detail page
6. Daily update page
7. Resource sharing page
8. Tooltip and explanation content
9. API config, model config, env config, and real-call validation where possible

## Hard rules

- Do not touch `main`
- Do not modify the daytime local repo
- Work only on the GitHub nightly branch and each agent's own runtime copy
- Commit in small stages
- Push multiple times if useful
- Keep user-facing explanations simple and actionable
- Prefer one clear next step over dense theory

## Desired output by morning

- A testable nightly branch
- Clearer student and teacher main paths
- Better five-rate explanation and supporting context
- Tooltip / explanation coverage started or improved
- API reading, connection attempts, and issue notes recorded
- Agent 2 execution report
- Agent 3 review verdict

## Review roles

- Agent 2: implementation, run checks, API/config validation
- Agent 3: UX/product review from student/teacher perspective, plus quality/risk review

## Stop rule for this first dispatch cycle

This first dispatch cycle is complete when:

1. Agent 2 has pushed one new coherent improvement batch to the nightly branch and written a report
2. Agent 3 has written a baseline review or first-pass review packet
3. Agent 1 can issue the next smallest overnight instruction from those outputs
