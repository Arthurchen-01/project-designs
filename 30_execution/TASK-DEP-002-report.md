# TASK-DEP-002 Report: Deploy AP Tracker to Machine 3

**Task:** TASK-DEP-002 — Install dependencies and deploy AP Tracker
**Agent:** 2
**Date:** 2026-04-02 07:41 CST
**Status:** ✅ PASS

## What Changed

1. SSH access to Machine 3 (42.192.56.101) confirmed with `ubuntu/ASDqwe12345`
2. Project code (`ap-tracker`) uploaded to `/home/ubuntu/ap-tracker/`
3. `npm install` completed (241 packages, 0 vulnerabilities)
4. Prisma client generated, SQLite database created via `prisma db push`
5. Docker 28.2.2 installed via `docker.io` (Ubuntu repo), service started and enabled on boot
6. Nginx installed and configured as reverse proxy (port 80 → 3000)
7. SSL certificate issued via Let's Encrypt (expires 2026-06-30, auto-renew enabled)
8. HTTP → HTTPS redirect configured
9. PM2 installed, ap-tracker running under PM2 (process manager)
10. PM2 systemd service enabled for boot persistence

## Machine 3 Health Summary

| Item | Value |
|---|---|
| OS | Ubuntu 24.04.4 LTS |
| CPU | 2 cores |
| RAM | 1.9GB (1.1GB available) |
| Disk | 40GB (13GB free, 66% used) |
| Node | v22.22.0 |
| Python | 3.12.3 |
| Docker | 28.2.2 ✅ |
| Nginx | 1.24.0 |
| Timezone | Asia/Shanghai |

## Services Running

| Service | Port | Status |
|---|---|---|
| SSH | 22 | ✅ |
| Next.js (PM2) | 3000 | ✅ HTTP 200 |
| Nginx (HTTP→HTTPS) | 80/443 | ✅ HTTP 200 |

## Endpoints

- **HTTPS:** https://samuraiguan.cloud/ → HTTP 200 ✅
- **HTTP→HTTPS:** http://samuraiguan.cloud/ → 301 redirect ✅
- **SSL:** Let's Encrypt, auto-renew, expires 2026-06-30

## What Passed

- [x] SSH access works
- [x] Node.js available
- [x] Code deployed to `/home/ubuntu/ap-tracker/`
- [x] Dependencies installed (241 packages, 0 vulnerabilities)
- [x] Database initialized (SQLite)
- [x] Docker installed and running
- [x] Dev server running via PM2
- [x] Nginx reverse proxy configured
- [x] SSL certificate issued
- [x] HTTP→HTTPS redirect working
- [x] External HTTPS access confirmed
- [x] Boot persistence (PM2 systemd service)

## Next Steps

- DEP-003: Already partially done (PM2). May need production build.
- DEP-004: Database setup (SQLite working, may need PostgreSQL for production)
- FD-003: Auth chain testing
- FD-004: Form submission testing
- FD-006: Local model integration testing

## Note

- Machine 2 (150.158.17.181) — skipped per architecture decision, all services run on Machine 3
