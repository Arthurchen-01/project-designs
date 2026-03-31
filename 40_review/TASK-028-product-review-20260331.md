# Agent 3 Product Review — Nightly Branch P1 Fixes

**Reviewer**: Agent 3 (product perspective)
**Date**: 2026-03-31 02:52+08:00
**Branch**: nightly/2026-03-31-confidence-fix

---

## Summary

Reviewed all pages, API routes, and lib modules in `30_execution/ap-tracker/`. 
The product is in good shape — all PRD V1 features are implemented. Found one P1 data-flow mismatch and a few P2/P3 items.

---

## 🔴 P1 — Daily Update Form/API Field Mismatch

The daily-update page (`src/app/[classId]/daily-update/page.tsx`) POSTs these fields:

```json
{
  "date": "2026-03-31",
  "subjectCode": "AP Macro",
  "taskType": "MCQ练习",       // ← sent as "taskType"
  "timedMode": "timed",
  "score": 38,                 // ← raw score
  "totalCount": 50,
  "correctCount": 42,
  "timeMinutes": 60,           // ← sent as "timeMinutes"
  "unit": "Unit 3",
  "notes": "..."               // ← sent as "notes"
}
```

But the API route (`src/app/api/daily-update/route.ts`) expects:

```ts
const {
  studentId,
  updateDate,        // expects "updateDate", frontend sends "date"
  subjectCode,
  activityType,      // expects "activityType", frontend sends "taskType"
  timedMode,
  durationMinutes,   // expects "durationMinutes", frontend sends "timeMinutes"
  scoreRaw,
  scorePercent,
  description,       // expects "description", frontend sends "notes"
} = body;
```

**Impact**: The API will fail or misread fields. The `activityType` and `description` are required by the API but will arrive as `undefined`.

**Fix**: Either change the frontend to send the field names the API expects, or add a mapping layer in the API. The frontend should send `activityType`, `updateDate`, `description`, `durationMinutes`.

---

## 🟡 P2 — Personal Page Confidence Calculation

In `personal/page.tsx`, the confidence level badge is computed client-side from `avgFiveRate`:

```tsx
const confidenceLevel = avgFiveRate >= 75 ? "高" : avgFiveRate >= 55 ? "中" : "低";
```

This doesn't use the recency-aware confidence from `confidence.ts` (TASK-029). A student with 5 records but 3 months stale would incorrectly show "高置信度" if their avgFiveRate is 75%+.

**Impact**: Product-level misleading confidence display. Contradicts TASK-029's goal.

**Fix**: Use the `confidenceLevel` field from the API response instead of recalculating from avgFiveRate. The API already passes through the correct confidence from snapshots.

---

## 🟡 P2 — Subject Detail Page Same Issue

`personal/[subjectId]/page.tsx` has the same client-side confidence calculation:

```tsx
const confidence = fiveRate >= 75 ? "高" : fiveRate >= 55 ? "中" : "低";
```

Same fix needed — use API-provided `confidenceLevel`.

---

## 🟢 P3 — Other Observations

1. **Dashboard looks good** — 4 cards + alerts center + exam calendar. Clean UX.
2. **Daily update form** — Well-structured with clear labels and placeholder text. 
3. **AI advice module** — Shows 3 numbered suggestions with loading state. Clean.
4. **Subject detail charts** — LineChart + BarChart + MCQ/FRQ tables. Comprehensive.
5. **Scoring engine** — 60/15/15/10 weight split is correct and matches PRD.
6. **Confidence recency** — `confidence.ts` correctly implements recency-aware logic.

---

## Product Readiness

| Aspect | Status |
|--------|--------|
| PRD feature coverage | ✅ 100% |
| Data flow correctness | 🔴 P1 field mismatch in daily-update |
| Confidence display | 🟡 P2 client-side calc overrides recency |
| UI/UX quality | ✅ Clean, consistent, well-structured |
| Error handling | ✅ Loading states, error messages, empty states |
| AI fallback | ✅ All AI modules have rule fallback |

---

## Recommended Next Steps

1. **Fix P1**: Align daily-update frontend form fields with API expectations
2. **Fix P2**: Use API-provided confidenceLevel in personal and subject detail pages
3. After fixes, run build to verify no regressions

---

*Agent 3 — Product perspective review complete*
