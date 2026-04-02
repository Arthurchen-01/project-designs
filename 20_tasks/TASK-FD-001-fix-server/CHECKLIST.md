# TASK-FD-001-fix: Fix AP Tracker Server & Core Functionality

**Priority:** P0 — fix immediately before any testing
**Agent:** 2

## Issues Found

1. **PM2 crash-loop (9913+ restarts):** root user runs `next start` on port 3000, PM2 (ubuntu user) tries `next dev` on same port → EADDRINUSE → crash → restart → loop
2. **404 on /api/auth/register:** register route missing or misrouted
3. **404 on /api/health:** health check endpoint missing
4. **No users in DB:** user table is completely empty
5. **No MIMO model service:** nothing running on port 8000
6. **Dev mode in production:** running `next dev` instead of production build
7. **No .env with AI_API_KEY:** can't call local model

## Required Fixes

### 1. Fix PM2 / Server Conflict
- Kill ALL processes on port 3000
- Kill PM2 ap-tracker
- Build production version: `next build`
- Restart with PM2 using `next start` only
- Verify server stable (0 restarts in 30s)

### 2. Fix / Enable Register Endpoint
- Check if `/api/auth/register` route exists in code
- If exists, ensure it's working
- If missing, create it
- Test: register user → verify in DB

### 3. Add Health Endpoint
- Create `/api/health` route returning `{"status":"ok"}`

### 4. Ensure Auth Chain Works
- Login endpoint already exists (returned {"error":"学生不存在"})
- Fix the auth flow: register → login → get user info
- Check that session/cookie mechanism works

### 5. Configure AI Model Call
- Check if MIMO is installed on Machine 3
- If yes, start the service on port 8000
- If no, document what's needed
- Set AI_API_KEY in environment (can be dummy for local)
- Update .env: `DATABASE_URL="file:./dev.db"` + AI config
- Verify backend can reach model

### 6. Full API Smoke Test
- GET /api/health → 200 + JSON
- POST /api/auth/register → creates user
- POST /api/auth/login → returns token/session
- GET /api/auth/me → returns user info
- POST /api/daily-update → saves record
- All admin endpoints → proper auth checks

## Deliverables
- `/home/ubuntu/ap-tracker/` running stable on port 3000
- PM2 showing 0-3 restarts, status=online
- All core API endpoints returning correct responses
- DB has user tables with correct schema
- Write test results to `30_execution/TASK-FD-001-fix-report.md`
