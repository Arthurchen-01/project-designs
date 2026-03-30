# Memory Model

Each agent keeps three layers under `memory/agent-x/`:

- `short-term/`: current day, current step, temporary blockers
- `mid-term/`: current task, milestone, rolling summaries
- `long-term/`: stable rules, lessons, recurring risks

Move facts upward when they will matter again. Do not rely on hidden chat state.
