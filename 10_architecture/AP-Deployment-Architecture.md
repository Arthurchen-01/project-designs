# AP Tracking Deployment Architecture

**Version:** 1.0
**Date:** 2026-04-01
**Based on:** User task TASK-AP-Deployment-Formal-20260401.md

## Overview
This architecture focuses on formalizing the backend deployment for AP Tracking on server #3 (IP: 42.192.56.101), with domain samuraiguan.cloud. It includes backend services, data layer, auth/permissions, admin backend support, AI config pre-reservation, reverse proxy, and documentation. No other projects are included.

## Server Roles
- Backend application node
- Data service node
- Auth and permissions node
- Admin backend dependency node
- AI call/config management node
- External API entry node

## Access Structure (Preferred: Single Domain + Paths)
- Main site: https://samuraiguan.cloud
- API: https://samuraiguan.cloud/api/*
- Admin: https://samuraiguan.cloud/admin/*

(Alternative subdomains if needed: api.samuraiguan.cloud, admin.samuraiguan.cloud)

## DNS
- Root @ to 42.192.56.101
- www optional to same

## Deployment Structure
- Code dir: /opt/ap-tracking/backend
- Scripts: /opt/ap-tracking/scripts
- Logs: /var/log/ap-tracking
- Env: /etc/ap-tracking/env
- Backups: /opt/ap-tracking/backups
- DB storage: /var/lib/postgresql (example)
- Uploads: /opt/ap-tracking/uploads

## Data Layer
- Isolated DB for AP Tracking
- Tables: users, roles, user_roles, sessions, classes, subjects, student_subjects, daily_updates, test_records, probability_snapshots, resources, resource_favorites, audit_logs, ai_providers, ai_routing_rules, ai_call_logs

## Auth System
- Registration, login, logout, user info
- Roles: admin, teacher, student
- Protected admin APIs
- JWT or sessions, hashed passwords

## Services
- Process manager: systemd (preferred for stability)
- Reverse proxy: Nginx
- HTTPS: Certbot/Let's Encrypt prepped

## Environment Variables
- DB_CONNECTION, JWT_SECRET, etc. in .env

## Micro-Tasks Decomposition
(See 20_tasks/ for details; decomposed into 10 micro-tasks matching user order.)

