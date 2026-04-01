# TASK-DEP-001 Machine Check Report

**Date:** 2026-04-02 07:20 CST
**Agent:** 1 (direct check)

## Machine 2 — 150.158.17.181

| Item | Value |
|---|---|
| User | `ubuntu` |
| Password | ASDqwe12345 |
| Hostname | VM-0-7-ubuntu |
| OS | Ubuntu 24.04, Kernel 6.8.0-101-generic |
| CPU | 2 cores |
| RAM | 1.9 GiB (593 MiB available) |
| Disk | 40G total, 4.7G free (88% used) |
| Docker | ❌ not installed |
| OpenClaw | ✅ 2026.3.28 |
| SSH | ✅ OK |

**⚠️ Disk warning: 88% used, only 4.7G free.** May need cleanup before deployment.

## Machine 3 — 42.192.56.101

| Item | Value |
|---|---|
| User | `root` (ubuntu user password rejected) |
| Password | ASDqwe12345 |
| Hostname | VM-0-5-ubuntu |
| OS | Ubuntu 24.04, Kernel 6.8.0-101-generic |
| CPU | 2 cores |
| RAM | 1.9 GiB (486 MiB available) |
| Disk | 40G total, 15G free (62% used) |
| Docker | ❌ not installed |
| OpenClaw | ✅ 2026.3.28 |
| SSH | ✅ OK (root) |

## Verdict

- **Both machines reachable** ✅
- **Neither has Docker** — need to install for deployment
- Machine 2 disk is tight (88%), Machine 3 is fine (62%)
- Machine 3 login is `root`, not `ubuntu`
