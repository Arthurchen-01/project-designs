# TASK-FD-FIX: AP Tracker Final Testing & Fix Execution

**Agent:** 2 (Execution)
**Date:** 2026-04-02
**Target:** Machine 3 (42.192.56.101, SSH user: ubuntu, password: ASDqwe12345)

## Diagnosis Summary

### Critical Issues Found

1. **PM2 crash-loop (10,000+ restarts):**
   - Root user systemd service (`ap-tracker.service`) runs `next start` on port 3000
   - PM2 (ubuntu user) runs `next dev` on same port 3000
   - Result: EADDRINUSE → crash → restart → loop forever
   - Root process PID 1324808: `npm exec next start -p 3000` (from systemd)
   - PM2 keeps spawning `next dev` which tries port 3000 → crash

2. **Register endpoint MISSING:**
   - No `/api/auth/register/route.ts` file exists
   - No `/api/health` route exists
   - Auth flow is `studentId`-only (just sets cookie), no email+password registration

3. **Login flow is broken:**
   - POST /api/auth/login requires `studentId` to already exist
   - No way to register a new student
   - DB tables are EMPTY (no users, no students)

4. **Auth uses cookies with studentId/classId only:**
   - Session = just a `studentId` cookie (no token verification)
   - User model has `passwordHash` but nothing uses it
   - No bcrypt or any password hashing dependency in package.json

5. **Two code locations (confusion):**
   - `/home/ubuntu/ap-tracker/` — deployed code (ubuntu user)
   - `/root/.openclaw/workspace-agent3/30_execution/ap-tracker/` — systemd service WorkingDirectory
   - Systemd service DB path: `file:/root/.openclaw/workspace-agent3/30_execution/ap-tracker/prisma/dev.db`
   - Ubuntu user DB path: `/home/ubuntu/ap-tracker/dev.db`
   - The systemd `next start` on port 3000 is serving from root's directory (which appears to be an old empty build)

6. **Prisma adapter issue:**
   - Uses `@prisma/adapter-libsql` but also `DATABASE_URL="file:./dev.db"` 
   - This may not work — Prisma v7 has native sqlite driver, no adapter needed typically
   
7. **No MIMO model on port 8000** — nothing listening

8. **Missing .env variables:**
   - No `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_KEY_ENCRYPTION_SECRET`

### What's Actually Serving Right Now
- Port 3000: root's `next start` process (PID 1324839) — serves from root's workspace, which has a basic Next.js app
- The actual app at `/home/ubuntu/ap-tracker/` is NOT serving correctly — PM2 keeps crashing
- API endpoints that DO work:
  - GET /api/auth/me → returns null (no cookie)
  - POST /api/auth/login → {"error":"缺少 studentId"} 
  - POST /api/daily-update → 401 (because no cookie)
- API endpoints that DON'T work:
  - POST /api/auth/register → 404 (missing)
  - GET /api/health → 404 (missing)

## Execution Plan

### Phase 1: Kill Conflict and Clean Slate
1. Stop systemd ap-tracker.service
2. Kill all node/next processes on port 3000
3. Stop PM2 ap-tracker
4. Verify port 3000 is free
5. Decide: use ONE codebase at /home/ubuntu/ap-tracker/
6. Update systemd service to point to ubuntu user's codebase OR run via PM2 only

### Phase 2: Fix Source Code

#### 2a. Add Register Endpoint
Create `/home/ubuntu/ap-tracker/src/app/api/auth/register/route.ts`
- Accepts: name, email, password, (optional: classId)
- Hashes password using Node.js native crypto (scryptSync — no bcrypt needed)
- Creates User in user table
- Creates a Student entry with the same user reference
- Sets class cookie if class exists
- Returns: success + studentId

#### 2b. Fix Login Endpoint  
Modify `/home/ubuntu/ap-tracker/src/app/api/auth/login/route.ts`
- Support BOTH modes:
  - Mode A (new): email + password → authenticate via user table
  - Mode B (legacy): studentId → just set cookie (for backward compat)
- Hash verification with scryptSync

#### 2c. Add Health Endpoint
Create `/home/ubuntu/ap-tracker/src/app/api/health/route.ts`
- Returns `{"status":"ok","timestamp":"..."}`

#### 2d. Fix Auth Guard
Fix `/home/ubuntu/ap-tracker/src/lib/auth-guard.ts` to properly check role from User table

#### 2e. Fix Logout
Logout should also clear any session tokens if we add them

### Phase 3: Fix Prisma Setup
- Check if `@prisma/adapter-libsql` is really needed or if Prisma v7 native sqlite works
- If libsql adapter causes issues, switch to Prisma native sqlite (built-in)
- Ensure `DATABASE_URL="file:./dev.db"` works correctly
- Run `npx prisma db push` to ensure schema is pushed

### Phase 4: Build and Deploy
1. Set up `.env` file at `/home/ubuntu/ap-tracker/.env`:
   ```
   DATABASE_URL="file:./dev.db"
   AI_BASE_URL="http://localhost:8000/v1"
   AI_MODEL="xiaomi/mimo-v2-pro"
   AI_KEY_ENCRYPTION_SECRET="some-256-bit-secret-key-here"
   AI_API_KEY="local-dev-key"
   ```
2. Do `next build` (production build)
3. Start with PM2: `pm2 start "npx next start -p 3000" --name ap-tracker`
4. Remove or disable the conflicting systemd service
5. Verify all endpoints work

### Phase 5: Test All Endpoints
1. GET /api/health → 200 OK
2. POST /api/auth/register → creates user
3. POST /api/auth/login → authenticates (email+password mode)
4. GET /api/auth/me → returns user info
5. POST /api/daily-update → with valid cookie
6. GET /api/daily-update → returns history
7. Admin endpoint protection
8. Verify DB entries exist

### Phase 6: Model Integration Prep
- Check if MIMO service is available on Machine 3
- If yes: verify connectivity
- If no: document requirement and ensure code handles gracefully

### Phase 7: Write Status Report
Write results to `30_execution/TASK-FD-FIX-report.md` on workspace-agent2

## SSH Details
- Host: 42.192.56.101
- User: ubuntu
- Password: ASDqwe12345
- Command: `sshpass -p 'ASDqwe12345' ssh -o StrictHostKeyChecking=no ubuntu@42.192.56.101 "COMMAND"`

## Git Repo
- Write report back to /home/ubuntu/.openclaw/workspace-agent2/30_execution/
