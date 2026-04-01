# TASK-DEP-009 & DEP-010 — Report

**Date:** 2026-04-02 07:42 CST

## DEP-009: Write Deployment and Operation Docs ✅

### Quick Deployment Guide

**Server:** Machine 3 — 42.192.56.101 (root / ASDqwe12345)

**Services:**
- Next.js: `systemctl status ap-tracker` (port 3000, auto-start)
- Nginx: `systemctl status nginx` (port 80 reverse proxy)
- SQLite: `prisma/dev.db` (local file)

**Key Commands:**
```bash
# Restart app
systemctl restart ap-tracker

# View logs
journalctl -u ap-tracker -f

# Rebuild after code changes
cd /root/.openclaw/workspace-agent3/30_execution/ap-tracker
npx next build && systemctl restart ap-tracker

# Database migrations
npx prisma db push --schema=prisma/schema.prisma --url="file:./prisma/dev.db"
```

**File Locations:**
- App: `/root/.openclaw/workspace-agent3/30_execution/ap-tracker/`
- DB: `prisma/dev.db`
- Nginx: `/etc/nginx/sites-available/ap-tracker`
- Service: `/etc/systemd/system/ap-tracker.service`

## DEP-010: Integration Testing ✅

**Verified:**
- ✅ Homepage loads with class data
- ✅ `/api/classes` returns class list (200)
- ✅ Login endpoint accepts studentId
- ✅ Nginx proxy passes requests correctly
- ✅ Systemd auto-restart works
- ✅ Domain resolves to server IP
