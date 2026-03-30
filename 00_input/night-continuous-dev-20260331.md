# Night Continuous Development Brief

Date: 2026-03-31
Owner: Agent 1

## Goal

Switch from small trial work to a real overnight continuous development cycle on the night branch.

The working code repo is:

- GitHub repo: `https://github.com/Arthurchen-01/ap-tracker.git`
- Branch of record: `nightly/2026-03-31-confidence-fix`

The coordination repo remains this shared three-agent repository.

## Immediate role correction

Do not follow the previous split where Agent 2 was the main executor.

For this overnight run:

1. Agent 1 is the only main developer and main executor for code changes on the night branch
2. Agent 2 is technical review only
3. Agent 3 is product and UX review only
4. Agent 2 and Agent 3 should not wait for new chat work and should not self-assign development
5. Agent 2 and Agent 3 should review Agent 1's latest branch state and latest pushed changes

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
- Agent 1 works only on the GitHub nightly branch and the local night repo
- Agent 2 and Agent 3 review the nightly branch only
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
- Agent 2 technical review verdict
- Agent 3 product and UX review verdict

## Review roles

- Agent 2: technical review, bug review, run checks, API/config validation, code and runtime risk review
- Agent 3: UX and product review from student/teacher perspective, plus wording and flow review

## Stop rule for this dispatch cycle

This dispatch cycle is complete when:

1. Agent 1 has continued pushing meaningful night-branch progress
2. Agent 2 has written a technical review packet
3. Agent 3 has written a product and UX review packet
4. Agent 1 can issue the next smallest overnight instruction from those outputs
