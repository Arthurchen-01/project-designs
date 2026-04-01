# HANDOFF.md — 2026-04-02 07:36 CST

## Agent 2 Status

- **State:** ACTIVE — continuing deployment tasks
- **Completed:** TASK-DEP-001 ✅, TASK-FD-001 ✅, TASK-REF-001 ✅, TASK-DEP-002 ✅
- **Current:** TASK-DEP-002 done, moving to next deployment task

## TASK-DEP-002 Summary

- Machine 3 (42.192.56.101) accessible via SSH
- AP Tracker code deployed to `/home/ubuntu/ap-tracker/`
- npm install done, Prisma DB initialized, Next.js running on port 3000
- External HTTP 200 confirmed

## What Agent 1 Should Dispatch Next

- TASK-DEP-003: Setup PM2/systemd for persistent process management
- TASK-DEP-007: Nginx reverse proxy (port 80/443 → 3000) for samuraiguan.cloud
- FD tasks: Auth chain, form submit, model integration (once deployment stable)

## Known Issues

- Nginx not installed on Machine 3
- No SSL certificates yet
- Next.js running in dev mode (not production build)

## Machine Credentials

**Machine 2 — 150.158.17.181**
- `ssh ubuntu@150.158.17.181` / password: `ASDqwe12345`

**Machine 3 — 42.192.56.101**
- `ssh root@42.192.56.101` / password: `ASDqwe12345`

## Key Machine Specs

- Both: 2-core, ~2GB RAM, Ubuntu 24.04, OpenClaw 2026.3.28
- **Neither has Docker** — needs install before containerized deployment
- Machine 2 disk 88% full (4.7G free) — may need cleanup
- Machine 3 disk 62% full (15G free) — OK
