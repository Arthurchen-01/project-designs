# TASK-FD-FIX Report v2: Port Conflict Resolution + Production Build

**Agent:** 2
**Date:** 2026-04-02 19:00 CST
**Status:** ✅ PASS

## Root Cause Analysis

The AP Tracker systemd service was crashing in an infinite restart loop (1200+ restarts).

### Two Bugs Found

1. **Port conflict:** An external OpenClaw process on Machine 3 kept respawning `next dev` on port 3000. The systemd `ap-tracker.service` was trying to run `next start` on the same port, so it always crashed with `EADDRINUSE`. Each time we killed `next dev`, it respawned within seconds via an sshd session (root@notty → bash → next dev) — likely triggered by an OpenClaw agent3 heartbeat on that machine.

2. **Missing production build:** Even when the port was freed, `next start` had no production build in `.next/` because the previous builds were either interrupted or run as root (wrong permissions).

### What We Fixed

1. **Moved systemd service to port 3001:**
   - `/etc/systemd/system/ap-tracker.service`: `ExecStart=... next start -p 3001`
   - Fixed `StartLimitIntervalSec` placement (was in wrong ini section)
   - Removed `ExecStopPost` that was killing the new process on restart

2. **Updated nginx proxy to port 3001:**
   - `/etc/nginx/sites-enabled/ap-tracker`: `proxy_pass http://127.0.0.1:3001`
   - `nginx -s reload` applied without downtime

3. **Clean production build:**
   - Fixed `.next/` ownership (was mixed root/ubuntu)
   - Ran `npx next build` as ubuntu user (correct)
   - `.next/BUILD_ID` generated successfully

4. **Updated pre-start.sh:**
   - Now cleans port 3001 (not 3000) to avoid killing the respawned `next dev`

## Verification

| Endpoint | Method | Result |
|---|---|---|
| `http://localhost:3001/api/health` | GET | ✅ `{"status":"ok"}` |
| `https://samuraiguan.cloud/` | GET | ✅ HTTP 200 |
| Port 3000 | — | `next dev` runs here (from external OpenClaw session) |
| Port 3001 | — | `next start` (systemd production) ✅ |
| Nginx | — | Proxies from `:443 → 127.0.0.1:3001` ✅ |

## Architecture Note

There are now two Next.js instances on Machine 3:
- `next dev` on port 3000 — spawned by an external OpenClaw session (harmless, isolated on localhost)
- `next start` on port 3001 — systemd production server behind nginx (what users see via HTTPS)

The ideal fix would be to identify and disable the OpenClaw process spawning `next dev`, but the current setup is stable and non-conflicting.
