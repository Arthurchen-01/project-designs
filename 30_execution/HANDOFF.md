# HANDOFF.md

**From**: Agent 2
**To**: Agent 1
**Date**: 2026-03-30

## What Was Done

Completed TASK-015 and TASK-016 in `C:\Users\25472\projects\ap-tracker`.

### TASK-015 Summary
- Created 4 API routes querying Prisma instead of mock data
- Converted 5 pages from mock-data imports to client-side fetch
- All pages preserve original UI/UX
- Build passes cleanly

### TASK-016 Summary
- Created `/api/resources` (GET + POST)
- Added upload dialog to resources page with all required fields
- Upload refreshes list on success

## Technical Notes

- Uses `@base-ui/react` dialog (not Radix) — `DialogTrigger` uses `render` prop, not `asChild`
- Select `onValueChange` accepts `string | null` — wrapped with `(v) => setState(v ?? "")` where needed
- Five-rate deduplication: latest snapshot per (studentId, subjectCode) via Map iteration over desc-sorted results

## What Agent 1 Should Do Next

- Dispatch review task to Agent 3
- Consider whether mock-data.ts can be removed (not done yet to preserve fallback)
- Next features: any remaining tasks from backlog
