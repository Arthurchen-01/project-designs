# Threats And Debug Cases

## High-risk areas

### 1. Secret leakage

Symptoms:

- PAT, app secret, or password appears in Feishu chat
- token gets pasted into repository files

Risk:

- Immediate credential compromise

Action:

- Rotate the credential
- Remove it from local notes when possible
- Never commit it into Git
- Agent 2 and Agent 3 must redirect secret handling to Agent 1

### 2. Wrong bot receives the mention

Symptoms:

- User thinks they mentioned a bot, but logs say `did not mention bot`
- one bot replies while the expected bot stays silent

Risk:

- wrong role acts on the wrong instruction

Action:

- give all three bots unique names
- always use real Feishu mention, not typed plain text
- inspect gateway log for `did not mention bot`

### 3. Bot identity recovery delay

Symptoms:

- log shows `bot open_id resolved: unknown`
- log shows `requireMention group messages stay gated until bot identity recovery succeeds`

Risk:

- group mentions are ignored for a short window after restart

Action:

- wait until `bot open_id resolved: <real id>` appears
- only test group mentions after `ws client ready`

### 4. Cross-app recipient contamination

Symptoms:

- heartbeat fails with Feishu `400`
- error contains `open_id cross app`

Risk:

- heartbeats and replies are sent to the wrong app namespace

Action:

- clear stale delivery queue
- clear stale session recipient mappings
- re-pair the user with the correct bot
- send one fresh direct message to establish the new session target

### 5. Session lock contention

Symptoms:

- `session file locked (timeout 10000ms)`
- reply fails before message is sent

Risk:

- one agent cannot complete a run

Action:

- ensure only one gateway process exists
- remove orphan heartbeat child session entries if needed
- clear stale `*.lock` files only after verifying the owning process is gone

### 6. Local gateway OOM

Symptoms:

- `127.0.0.1 refused connection`
- browser shows `ERR_CONNECTION_REFUSED`
- node process crashed with heap out-of-memory

Risk:

- local Agent 1 control page and gateway become unavailable

Action:

- restart gateway
- set `NODE_OPTIONS=--max-old-space-size=1024` for the local run if needed
- verify `http://127.0.0.1:18789/` returns successfully

### 7. Role drift in chat

Symptoms:

- Agent 3 starts designing product scope
- Agent 2 or Agent 3 accepts a GitHub token

Risk:

- execution/review nodes bypass Agent 1 and corrupt the workflow

Action:

- reinforce `AGENTS.md` and `HEARTBEAT.md`
- keep Agent 1 as the only intake node
- reset dirty sessions if a bot keeps answering from old chat context

### 8. Repo sync or network failure

Symptoms:

- `git pull` or `git fetch` fails
- heartbeat reports `SIGTERM` or cannot fetch from GitHub

Risk:

- nodes cannot see new dispatches

Action:

- retry on next heartbeat
- verify GitHub connectivity manually
- confirm PAT validity if HTTPS auth is used

## Debug checklist by symptom

### Symptom: Agent 1 does not respond in Feishu group

Check in order:

1. gateway process alive
2. `bot open_id resolved` present
3. `ws client ready` present
4. no `unknown` gating window still active
5. group log shows the message arrived
6. mention actually targeted Agent 1

### Symptom: Agent 2 responds correctly but Agent 3 does not review

Check in order:

1. `git status` clean and branch synced
2. `STATUS.md` marks a task as `Awaiting review`
3. `30_execution/HANDOFF.md` and `30_execution/STATUS-REPORT.md` exist
4. `40_review/` lacks the matching review file
5. agent3 session state is clean
6. only one gateway process exists

### Symptom: heartbeat only says `HEARTBEAT_OK`

Possible causes:

- no new work detected
- review target is ambiguous
- repo synced but task status not explicit enough
- session state is clean but the heartbeat run is too shallow

Action:

- confirm `STATUS.md` explicitly points at the current task
- confirm task packet and execution reports match the pending task

## Real incidents from this deployment

### Case 1: Agent 1 group mention ignored after restart

Observed:

- `bot info probe timed out`
- `bot open_id resolved: unknown`
- group mentions gated until recovery

Fix:

- wait for background retry to resolve the real bot identity
- retest only after the websocket is ready

### Case 2: Agent 2 reported `access not configured`

Observed:

- user got a Feishu pairing code

Fix:

- run `openclaw pairing approve feishu <code> --notify`
- confirm pending pairing list is empty

### Case 3: Agent 3 heartbeat failed with `open_id cross app`

Observed:

- stale delivery target pointed at the wrong app namespace

Fix:

- clean stale delivery queue
- clean stale session recipient state
- re-pair user on Agent 3
- establish a fresh direct message session

### Case 4: Agent 3 failed with `session file locked`

Observed:

- stale heartbeat child session plus duplicate runtime residue

Fix:

- reduce to one gateway process
- remove orphan heartbeat session entry
- restart the gateway cleanly

### Case 5: Agent 3 accepted product scope and token in chat

Observed:

- Agent 3 answered like an intake bot instead of a reviewer

Fix:

- tighten chat routing rules
- reset dirty chat/session state
- keep Agent 1 as the only intake endpoint

## Standard commands

Windows local:

```powershell
Get-Process | Where-Object { $_.ProcessName -like '*openclaw*' }
Invoke-WebRequest http://127.0.0.1:18789/ -UseBasicParsing
Get-Content C:\Users\25472\.openclaw\logs\gateway-agent1.log -Tail 120
git -C C:\Users\25472\.openclaw\workspace-agent1 status --short --branch
```

Linux remote:

```bash
ps -ef | grep openclaw | grep -v grep
tail -n 120 ~/.openclaw/logs/gateway-agent.log
cat ~/.openclaw/agents/main/sessions/sessions.json
find ~/.openclaw/agents/main/sessions -name '*.lock'
git -C <workspace> status --short --branch
git -C <workspace> log --oneline -5
```
