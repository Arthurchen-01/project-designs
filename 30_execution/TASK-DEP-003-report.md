# TASK-DEP-003 Deploy Backend — Report

**Date:** 2026-04-02 07:40 CST
**Machine:** 3 (42.192.56.101) — self-deploy
**Status:** ✅ PASS

## What Was Done

1. **Dependencies installed** (covered DEP-002 scope):
   - Docker 28.2.2 via `docker.io`
   - npm packages via npmmirror (original registry unreachable)
   - Prisma client generated

2. **Database initialized**:
   - SQLite via Prisma db push
   - Schema deployed: User, Class, Student, Subject, AssessmentRecord, etc.
   - Seed data: 1 class ("AP备考班 2026")

3. **Build fixes** (TypeScript null safety):
   - `src/app/api/dashboard/alerts/route.ts` — null-safe score/maxScore
   - `src/lib/scoring-engine.ts` — filter null records before scoring
   - `src/lib/scoring-engine-v2.ts` — same null safety fix
   - `.env` — DATABASE_URL set to absolute path

4. **Production build**: ✅ Next.js 15.5.14 compiled, 24 pages generated

5. **Nginx reverse proxy**: configured for `samuraiguan.cloud → localhost:3000`

6. **Systemd service**: `ap-tracker.service` enabled, auto-starts on boot

## Live Status

- `http://samuraiguan.cloud` → HTTP 200 ✅
- `http://samuraiguan.cloud/login` → HTTP 200 ✅
- Service: `systemctl status ap-tracker` → active (running)

## Note

- DEP-004 (setup database) is done — SQLite deployed
- DEP-005 (configure auth) — JWT auth already in codebase, needs runtime test
- DEP-007 (setup proxy) is done — Nginx configured
- Several DEP tasks overlap with what's already implemented in code
