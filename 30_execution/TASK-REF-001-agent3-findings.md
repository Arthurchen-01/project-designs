# TASK-REF-001 — Agent 3 Pairing Report: Network Egress Scan

**Agent:** 3 (Pairing & Verifying)
**Date:** 2026-04-02 01:50+08:00
**Role:** Support Agent 2 on network seal, verify local MIMO path

---

## Scan Results

### 🔴 CRITICAL: Public API Default in ai-config.ts

**File:** `30_execution/ap-tracker/src/lib/ai-config.ts`
**Line 26:**
```typescript
const DEFAULT_BASE_URL = 'https://api.openai.com/v1'
```

**Risk:** If no database AIProvider is configured and no `OPENAI_BASE_URL` env var is set, all AI calls (evaluator, explainer, advisor) will hit `api.openai.com` — a direct violation of the owner directive.

**Impact:** This is the **fallback path**. Even if a local MIMO provider is configured in the database, if that provider record is deleted or becomes inactive, the system silently falls back to OpenAI's public API.

**Recommendation:** Change `DEFAULT_BASE_URL` to the local MIMO endpoint (e.g., `http://localhost:8000/v1`) or set it to empty string to force explicit configuration.

### Other External URLs Found

| File | URL | Risk |
|---|---|---|
| `ai-config.ts:26` | `https://api.openai.com/v1` | 🔴 CRITICAL — default fallback |
| `ai-config.ts:8` | Comment reference only | ✅ Safe |
| `admin/ai/page.tsx:430` | Placeholder text in form field | ✅ Safe (UI only) |
| `resources/page.tsx:245` | Placeholder text `https://...` | ✅ Safe (UI only) |

### No External URLs Found (Clean)

- ✅ `ai-evaluator.ts` — uses `config.baseUrl` (from config, not hardcoded)
- ✅ `ai-advisor.ts` — uses config
- ✅ `ai-explainer.ts` — uses config
- ✅ `.env` — only `DATABASE_URL="file:./dev.db"` (local SQLite)
- ✅ Prisma generated files — doc links only, no runtime calls

### Machine #3 Local MIMO Endpoint

**Status:** ❌ UNREACHABLE

Tried ports 8000, 8080, 8888, 3000, 5000, 7860, 7861, 11434 on `42.192.56.101` — all connection refused. The MIMO model server is either not running or listening on a non-standard port.

**Action needed:** Agent 2 or Agent 1 should verify MIMO server status on machine #3.

---

## Summary

1. **1 critical finding:** `DEFAULT_BASE_URL` points to OpenAI public API
2. **No other hardcoded external URLs** in runtime code (only placeholders/comments)
3. **MIMO endpoint unreachable** — server may not be running

## Recommended Immediate Fix

```typescript
// ai-config.ts line 26
// BEFORE:
const DEFAULT_BASE_URL = 'https://api.openai.com/v1'

// AFTER (option A — local MIMO):
const DEFAULT_BASE_URL = 'http://localhost:8000/v1'

// AFTER (option B — force explicit config, no silent fallback):
const DEFAULT_BASE_URL = ''
```

Option B is safer — forces the system to fail loudly if no provider is configured, rather than silently hitting OpenAI.
