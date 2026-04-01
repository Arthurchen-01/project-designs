# TASK-FD-001 Report: Public Network Access Audit

**Task:** TASK-FD-001 Seal Off Public Network Access
**Agent:** 2
**Date:** 2026-04-02 03:55 CST

## Audit Scope

Scanned `src/lib/` and `src/app/api/` for all outbound `fetch()` calls, API keys, and public service references.

## Findings

### 1. External HTTP Calls (5 locations)

| File | Line | Call | Risk |
|---|---|---|---|
| `src/lib/ai-evaluator.ts` | 73 | `fetch(config.baseUrl + '/chat/completions')` | ⚠️ Conditional |
| `src/lib/ai-explainer.ts` | 120 | `fetch(config.baseUrl + '/chat/completions')` | ⚠️ Conditional |
| `src/lib/explanation.ts` | 117 | `fetch(config.baseUrl + '/chat/completions')` | ⚠️ Conditional |
| `src/lib/ai-advisor.ts` | 26 | `fetch(config.baseUrl + '/chat/completions')` | ⚠️ Conditional |
| `src/app/api/admin/ai/providers/[id]/test/route.ts` | 26 | `fetch(provider.baseUrl + '/chat/completions')` | ⚠️ DB-driven |

### 2. Default Configuration (✅ SAFE)

- `ai-config.ts`: `DEFAULT_BASE_URL = 'http://localhost:8000/v1'` (local MIMO)
- `DEFAULT_MODEL = 'xiaomi/mimo-v2-pro'`
- `.env`: Only contains `DATABASE_URL="file:./dev.db"` — no public API keys

### 3. Environment Variable References (⚠️ POTENTIAL VECTOR)

All 4 AI modules read from these env vars:
- `AI_BASE_URL` / `OPENAI_BASE_URL` — falls back to localhost:8000 ✅
- `AI_API_KEY` / `OPENAI_API_KEY` — empty default ✅
- `AI_MODEL` / `OPENAI_MODEL` — defaults to local model ✅

If env vars are set to public endpoints, modules will call public APIs.

### 4. Database-Driven Config (⚠️ POTENTIAL VECTOR)

- `ai-config.ts` reads `AIProvider.baseUrl` from database
- Admin AI Provider test route calls `provider.baseUrl` directly
- If a provider with public URL is configured, calls will go to public net

### 5. Admin UI References

- `src/app/admin/ai/page.tsx` line 425: placeholder says "openai / openrouter / custom"
- `src/app/admin/ai/page.tsx` line 430: placeholder URL "https://api.openai.com/v1"
- These are UI text only, not functional, but misleading for air-gapped deployment

## Recommendations

1. **Block public API calls**: Add validation in `ai-config.ts` to reject `baseUrl` not matching `localhost` or `127.0.0.1` or local subnet
2. **Validate DB providers**: Add a check in `getConfigFromDB()` to only allow providers with local base URLs
3. **Admin route protection**: The provider test route should validate baseUrl is local before making the request
4. **Remove OPENAI_* env vars**: Remove backward compatibility for `OPENAI_API_KEY`/`OPENAI_BASE_URL` to prevent accidental exposure
5. **Nginx proxy**: Use nginx config to block outbound traffic entirely (TCP-level seal)

## No Direct Fixes Required

The code defaults to localhost:8000 and has no public API keys. The risk is **conditional** — only triggered if env vars or database records point to public endpoints. For true air-gapped deployment, a network-level firewall (ufw/iptables) is the primary defense; code-level validation is a defense-in-depth measure.

## Files Scanned

- `src/lib/ai-config.ts`
- `src/lib/ai-evaluator.ts`
- `src/lib/ai-explainer.ts`
- `src/lib/ai-advisor.ts`
- `src/lib/explanation.ts`
- `src/app/api/admin/ai/providers/[id]/test/route.ts`
- `src/app/admin/ai/page.tsx`
- `.env`
