# Three-Server Bootstrap Runbook

## Goal

Bring three OpenClaw nodes from zero to the current single-Feishu-group operating model:

- Agent 1: local command center
- Agent 2: execution node
- Agent 3: review node
- Shared coordination backbone: one GitHub repository
- Chat surface: one Feishu group, with Agent 1 as the only intake endpoint

## Current topology

| Role | Host | Login user | Workspace | Model | Heartbeat |
|---|---|---|---|---|---|
| Agent 1 | local Windows | current desktop user | `C:\Users\25472\.openclaw\workspace-agent1` | `openrouter/xiaomi/mimo-v2-pro` | `5m` |
| Agent 2 | `150.158.17.181` | `ubuntu` | `/home/ubuntu/.openclaw/workspace-agent2` | `claude/claude-sonnet-4-6` | `3m` |
| Agent 3 | `42.192.56.101` | `root` | `/root/.openclaw/workspace-agent3` | `openrouter/xiaomi/mimo-v2-pro` | `5m` |

## Secrets policy

- Do not commit any token, password, or Feishu app secret into Git.
- Keep GitHub PAT, Feishu app credentials, and gateway auth tokens in a password manager or local private notes.
- If a secret was pasted into Feishu chat, rotate it after setup is stable.

## Required components on every node

- Git
- Node.js + pnpm
- Python 3
- OpenClaw `2026.3.28`
- Access to the shared GitHub repository
- A Feishu app configured for long-connection mode

## Step 1: install OpenClaw

```bash
pnpm add -g openclaw@2026.3.28
openclaw --version
```

Expected result:

- Version prints `2026.3.28`

## Step 2: prepare the workspace

Clone the runtime repository to the role-specific workspace path.

Agent 1:

```powershell
git clone https://github.com/Arthurchen-01/project-designs.git C:\Users\25472\.openclaw\workspace-agent1
Set-Content C:\Users\25472\.openclaw\workspace-agent1\.agent-role.local agent1
```

Agent 2:

```bash
git clone https://github.com/Arthurchen-01/project-designs.git /home/ubuntu/.openclaw/workspace-agent2
printf 'agent2\n' > /home/ubuntu/.openclaw/workspace-agent2/.agent-role.local
```

Agent 3:

```bash
git clone https://github.com/Arthurchen-01/project-designs.git /root/.openclaw/workspace-agent3
printf 'agent3\n' > /root/.openclaw/workspace-agent3/.agent-role.local
```

## Step 3: configure OpenClaw

Only the relevant effective fields are shown below. Keep secrets out of Git and inject the real values locally.

```json
{
  "plugins": {
    "allow": ["feishu"],
    "entries": {
      "feishu": {
        "enabled": true,
        "config": {}
      }
    }
  },
  "gateway": {
    "mode": "local",
    "auth": {
      "mode": "token",
      "token": "<local-generated-token>"
    }
  },
  "agents": {
    "defaults": {
      "workspace": "<role-specific-workspace>",
      "model": {
        "primary": "<role-model>"
      },
      "heartbeat": {
        "every": "<3m-or-5m>",
        "target": "feishu",
        "directPolicy": "allow",
        "prompt": "Read AGENTS.md and HEARTBEAT.md from the workspace root. Also read docs/OPERATING-MODEL.md and docs/MEMORY-MODEL.md when present. Detect role from the workspace path or .agent-role.local. Follow the role strictly. In single Feishu group mode, Agent 1 is the only intake endpoint for new user work. If nothing needs action, reply HEARTBEAT_OK.",
        "ackMaxChars": 300,
        "lightContext": true,
        "isolatedSession": true
      }
    }
  }
}
```

Role-specific values:

- Agent 1 workspace: `C:\Users\25472\.openclaw\workspace-agent1`
- Agent 2 workspace: `/home/ubuntu/.openclaw/workspace-agent2`
- Agent 3 workspace: `/root/.openclaw/workspace-agent3`

## Step 4: connect Feishu

Checklist:

- Use one Feishu app per node
- Enable persistent connection mode for each app
- Bring all three bots into the same Feishu group
- Give each bot a distinct visible display name
- Agent 1 is the only intake bot for new work

Pairing process:

1. Start the gateway on the node.
2. Let the user trigger Feishu access pairing from that bot.
3. Approve the pairing on the node:

```bash
openclaw pairing list
openclaw pairing approve feishu <PAIRING_CODE> --notify
```

4. Verify the pending list is empty.

## Step 5: start the gateway

Agent 1 on Windows:

```powershell
openclaw gateway run
```

Agent 2 and Agent 3 on Linux:

```bash
nohup bash -lc "openclaw gateway run" > ~/.openclaw/logs/gateway-agent.log 2>&1 < /dev/null &
```

## Step 6: verify health

On every node:

```bash
openclaw --version
```

Then verify:

- workspace path is correct
- only one gateway process exists
- Feishu long connection is ready
- `bot open_id resolved` appears in log
- no stale session lock remains
- `git status --short --branch` is clean

Useful checks:

```bash
ps -ef | grep openclaw | grep -v grep
tail -n 80 ~/.openclaw/logs/gateway-agent.log
cat ~/.openclaw/agents/main/sessions/sessions.json
git -C <workspace> status --short --branch
git -C <workspace> log --oneline -5
```

## Step 7: confirm the operating model

The shared repository files that matter most are:

- `AGENTS.md`
- `HEARTBEAT.md`
- `STATUS.md`
- `00_input/`
- `20_tasks/`
- `30_execution/`
- `40_review/`

Expected responsibilities:

- Agent 1 reads user requests, updates architecture, dispatches tasks, and updates `STATUS.md`
- Agent 2 only executes repository-dispatched work and writes `30_execution/`
- Agent 3 only reviews repository-dispatched work and writes `40_review/`

## Current single-group policy

- Only Agent 1 accepts new requirements
- Agent 2 and Agent 3 must redirect direct new work to Agent 1
- Agent 2 and Agent 3 must not take custody of tokens or passwords
- Status reports in chat are allowed
- Hidden chat state is never the source of truth; the repository is

## Smoke test

1. In Feishu, send a new requirement only to Agent 1.
2. Confirm Agent 1 writes or updates `00_input/`, `10_architecture/`, `20_tasks/`, and `STATUS.md`.
3. Wait for Agent 2 heartbeat or execution action.
4. Confirm Agent 2 updates `30_execution/HANDOFF.md` and `30_execution/STATUS-REPORT.md`.
5. Wait for Agent 3 heartbeat or review action.
6. Confirm Agent 3 writes `40_review/TASK-XXX-review-YYYYMMDD.md`.

## Recovery baseline

If a node drifts badly:

1. Back up `~/.openclaw`
2. Stop duplicate gateway processes
3. Reinstall OpenClaw `2026.3.28`
4. Recreate the workspace from GitHub
5. Restore only required local config and Feishu pairing
6. Re-verify pairing, long connection, and repo sync
