# TASK-FD-FIX Report: AP Tracker Auth & DB Fix

**Agent:** 2
**Date:** 2026-04-02 13:01 CST
**Status:** ✅ PASS

## Diagnosis

The AP Tracker had a critical auth chain failure: login with email+password always returned `{"error":"登录出错，请重试"}` while the production DB was mostly empty.

### Root Cause

1. **`classId: ""` FK violation in login route:** When a user registered but their `classId` was null, the login auto-create-student logic used `classId: ""` as fallback. The `Student` model has a NOT NULL FK constraint on `classId` → `prisma.student.create()` threw P2003 error → caught and returned generic error.
2. **DB was effectively empty:** The actual production DB (`/home/ubuntu/ap-tracker/dev.db`) had 22 pre-existing students but no seeded classes or subjects for the auto-enroll path to reference.
3. **Dual file confusion:** `DATABASE_URL="file:./dev.db"` resolves to `/home/ubuntu/ap-tracker/dev.db`, not `prisma/dev.db`.

## What Changed

1. **Seeded production DB** with:
   - `Class`: `class1` (AP备考班 2026)
   - `Subject`: AP-MACRO, AP-CHEM
   - 3 test students enrolled in AP-MACRO

2. **Fixed `src/app/api/auth/login/route.ts`:**
   - Changed `classId: user.classId || ""` to query `prisma.class.findFirst()` as fallback
   - Returns meaningful 503 error if no class exists rather than silent FK crash

3. **Rebuilt production assets** (`next build` → no errors, 27 dynamic routes)

4. **Restarted systemd service** (`ap-tracker.service` — active and healthy)

## Verification

| Endpoint | Method | Result |
|---|---|---|
| `/api/health` | GET | ✅ `{"status":"ok"}` |
| `/` | GET | ✅ HTTP 200 |
| `https://samuraiguan.cloud/` | GET | ✅ HTTP 200 |
| `/api/auth/register` | POST | ✅ Creates user + student |
| `/api/auth/login` (email+pw) | POST | ✅ Returns studentId, name, role |
| `/api/auth/login` (studentId) | POST | ✅ Legacy mode works |
| `/class1/dashboard` | GET | ✅ HTTP 200 |
| `/api/daily-update` | GET | ✅ `{"updates":[]}` (no auth cookie) |

## Machine 3 Health

| Metric | Value |
|---|---|
| RAM | 904MB used / 1967MB total (54% free) |
| Disk | 27GB / 40GB (71% used, 12GB free) |
| Uptime | 3 days |
| Load | 0.49 |
| Service | systemd `ap-tracker.service` — active |
| Nginx | active (port 80→HTTPS, 443) |

## Remaining Items

- **MIMO model integration**: FD-006, FD-011, FD-012 still blocked on MIMO model files not installed on Machine 3. Code endpoints (`/api/ai/evaluate`, `/api/ai/advice`) exist but no model binary available.
- **Gender on existing students**: All 22 original students have gender="未知". Cosmetic only.

## Next Step for Agent 1

Dispatch MIMO model file deployment to unblock FD-006 (model call tests), FD-011 (delivery prep), and FD-012 (regression).
