# TASK-015 & TASK-016 Execution Report

**Agent**: Agent 2 (Delivery)
**Date**: 2026-03-30
**Status**: ✅ COMPLETED

---

## TASK-015: Pages Switch from Mock Data to Database

### API Routes Created

| Route | Method | Description |
|-------|--------|-------------|
| `/api/dashboard` | GET | Class dashboard metrics (total subjects, avg five-rate, avg MCQ/FRQ) |
| `/api/dashboard/[metric]` | GET | Metric detail: subjects, five-rate, mcq, frq breakdown per student |
| `/api/student/[studentId]` | GET | Student profile: info, five-rates, MCQ/FRQ stats, timed vs untimed |
| `/api/student/[studentId]/[subjectCode]` | GET | Subject detail: five-rate, confidence, trend, test records |

### Pages Updated

| Page | Before | After |
|------|--------|-------|
| `dashboard/page.tsx` | Server component, imports `classroom` from mock-data | Client component, fetches `/api/dashboard` |
| `dashboard/[metric]/page.tsx` | Server component, imports mock-data | Client component, fetches `/api/dashboard/[metric]` |
| `personal/page.tsx` | Server component, imports mock-data | Client component, fetches `/api/student/[id]` + `/api/students` |
| `personal/[subjectId]/page.tsx` | Client component, imports mock-data | Client component, fetches `/api/student/[id]/[subject]` |
| `resources/page.tsx` | Client component, imports mock-data | Client component, fetches `/api/resources` |

### Key Design Decisions

- All pages converted to `'use client'` with `fetch` + `useEffect` pattern
- API routes query Prisma directly with proper aggregation logic
- Five-rate uses latest snapshot per (studentId, subjectCode) via deduplication
- Dashboard route uses `StudentSubject.count` for total subjects
- Timed vs untimed comparison preserved across all views

---

## TASK-016: Resource Upload

### API Route

- `POST /api/resources` - Creates new resource (requires: uploaderId, subjectCode, title, resourceType)
- `GET /api/resources` - Lists resources with optional `?subjectCode=` filter

### UI Changes

- Added "上传资源" button in resources page header
- Opens shadcn/ui Dialog with form fields:
  - 标题 (required, text input)
  - 科目 (required, select from 8 AP subjects)
  - 类型 (required, select: notes/video/practice/flashcards)
  - 简介 (optional, textarea)
  - 链接 (optional, text input)
- After successful POST, list auto-refreshes
- Current user ID fetched from `/api/auth/me`

---

## Build Verification

- `npm run build` ✅ — No TypeScript errors
- All 14 routes compiled successfully
- Static + dynamic routes properly configured

## Git

- Commit: `ad841e7` on `master`
- 10 files changed, 961 insertions, 445 deletions
