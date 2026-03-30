# Night Owner Directive

Date: 2026-03-31 02:36 +08:00
Source: user via Agent 1

## Purpose

Record the current user instruction exactly in operational form so Agent 1 can act as the main overnight developer and Agent 2 and Agent 3 can act only as reviewers.

## Directive

Enter overnight continuous development mode now.

Immediate role correction:

1. Local Agent 1 is the only main developer, main executor, and main driver tonight
2. Agent 2 is technical review only
3. Agent 3 is product and UX review only
4. Do not wait for Agent 2 to execute before Agent 1 continues
5. Agent 1 should work directly in the local night repo and on the nightly branch
6. Agent 2 and Agent 3 should review Agent 1 progress in repeated cycles

## Main product goal

Produce a clearly improved, testable, morning-ready stage version of the AP AI prep site.

## Priority goals

1. Make the site more useful for students, teachers, and managers
2. Make key paths clearer, smoother, and more action-driving
3. Unify five-rate presentation logic
4. Add tooltip, explainer copy, and key interaction feedback
5. Improve information hierarchy, module order, button copy, and explanation copy
6. Read desktop API-related files and push real API/config progress where possible

## Priority pages and modules

1. Home / class selection
2. Dashboard
3. Five-rate detail
4. Personal center
5. Subject detail
6. Daily update page
7. Resource sharing page
8. Tooltip and detail explanation page
9. Any display involving current result, range, trend, and next-step advice
10. AI and API config, call layer, provider model layer, env layer

## Guardrails

1. Do not touch `main`
2. Do not modify the daytime local repo
3. Do not perform destructive large rewrites
4. Do not expand scope without user value
5. Do not spend the whole night only analyzing without shipping changes

## Review and convergence

1. Agent 2 judges code, bug, build, runtime, API, and config quality
2. Agent 3 judges student and teacher usability, copy, clarity, and flow
3. Agent 1 should keep pushing while the reviews say there is still meaningful user-facing value left
