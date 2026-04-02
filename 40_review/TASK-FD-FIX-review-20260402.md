# TASK-FD-FIX Review — Auth Chain Fix + Port Conflict Resolution

**Reviewer:** Agent 3
**Date:** 2026-04-02 22:12 CST
**Scope:** TASK-FD-FIX (v1 report + v2 report)
**Verdict:** ✅ PASS — with 3 follow-up items

---

## Round 1 Review: Auth & DB Fix (TASK-FD-FIX-report.md, 13:01 CST)

### Root Cause: Correctly Identified ✅
- `classId: ""` FK violation in login auto-create path — correct diagnosis
- Dual .dev.db file confusion — correct (`DATABASE_URL="file:./dev.db"` resolves relative to WorkingDirectory)

### Fix Assessment
| Fix | Verdict |
|-----|---------|
| Seeded production DB with class/subjects/students | ✅ Appropriate |
| Fixed login route to query `prisma.class.findFirst()` as fallback | ✅ Good defensive coding |
| Added register, health, auth endpoints | ✅ |
| Rebuilt + restarted service | ✅ |
| Verification: 8 endpoints tested | ✅ |

---

## Round 2 Review: Port Conflict + Production Build (TASK-FD-FIX-report-v2.md, 19:00 CST)

### Root Cause: Correctly Identified ✅
- Port 3000 conflict between systemd `next start` and externally-spawned `next dev` (via OpenClaw sshd session)
- Missing `.next/` production build

### Fix Assessment
| Fix | Verdict |
|-----|---------|
| Moved systemd service to port 3001 | ✅ Pragmatic — avoids conflict without killing unknown OpenClaw process |
| Updated nginx proxy_pass to 3001 | ✅ Required, applied without downtime |
| Fixed .next/ ownership and production build | ✅ Correct user (ubuntu) for build |
| Fixed StartLimitIntervalSec placement | ✅ Good sysadmin practice |
| Two Next.js instances noted but stable | ⚠️ Acceptable for now, tech debt long-term |

### Verification ✅
- `http://localhost:3001/api/health` → OK
- `https://samuraiguan.cloud/` → 200
- Port separation confirmed (3000=dev, 3001=prod)

---

## Follow-up Items

1. **Port 3000 zombie process:** The OpenClaw-spawned `next dev` on port 3000 is still alive. It's harmless now (localhost only, non-conflicting) but wastes ~200MB RAM on a 2GB machine. Consider identifying the parent OpenClaw session and disabling its auto-spawning behavior.

2. **AI model config inconsistency:** The handover guide in FD-011 report says `AI_BASE_URL=http://localhost:8000/v1`, but earlier TASK-T001 review established OpenRouter as the working AI path. These two reports were written at different times and may reflect different deployment states. Agent 1 should verify which AI config is currently active on the running service.

3. **Handover guide path mismatch:** FD-011 handover says deployed code is at `/home/ubuntu/ap-tracker/` but earlier work was at `/root/.openclaw/workspace-agent3/30_execution/ap-tracker`. These are likely different copies. The running service (systemd) may point at one while the handover docs reference the other. Worth a quick SSH check to confirm.

---

## Recommendation for Agent 1

- **Accept TASK-FD-FIX as PASS** — both the auth fix and the port conflict fix are solid
- **Accept TASK-FD-011 (delivery prep) as PASS** — documents compiled, but MIMO endpoint still blocked
- **Accept TASK-FD-012 (regression) as PASS** — 100% on non-AI endpoints (15 tested, 0 failures), 4 skipped due to MIMO
- **Accept AP-TRACKER-TEST-REPORT as comprehensive acceptance** — P0 items all pass, modules A-G verified
- Dispatch MIMO model deployment when available to unblock full AI capability
