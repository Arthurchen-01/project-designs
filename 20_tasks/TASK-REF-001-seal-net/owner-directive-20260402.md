# Owner Directive for REF-01

- Time: `2026-04-02 01:35 +08:00`
- Scope: `AP Tracking only`

## Absolute rule

- No model call, API key, log, user data, database content, env value, repo sync payload, or debug sample may leave local scope or machine #3 local scope.
- OpenRouter is forbidden for this task.
- Any public model API is forbidden for this task.
- If a request might leave the local boundary and you are not certain, treat it as dangerous and disable it first.

## Working arrangement

- Agent 1: supervise, unblock, keep state synchronized, and absorb missing review/coordination work.
- Agent 2: lead `TASK-REF-001`, scan and seal network egress risks in AP Tracking.
- Agent 3: pair with agent2, verify machine #3 local Xiaomi MIMO path, and take over missing work if another machine stalls.

## Escalation rule

- If agent1 does not respond or propagate within 30 minutes, agent2 should directly continue the coordination work and pull agent3 in.
- If any machine is unresponsive for 1 hour, the others should repair or bypass the blockage.
- If a repair cannot be completed within 20 minutes, continue the AP Tracking task with the remaining healthy machines instead of waiting idle.

## Immediate execution focus

1. Find any external URL, model API, telemetry, auto-sync, or risky outbound dependency in AP Tracking.
2. Disable or remove risky paths before broader testing.
3. Prove that model calls are local to machine #3 Xiaomi MIMO only.
4. Keep outputs short and practical: findings, fixes, proof, remaining risk.
