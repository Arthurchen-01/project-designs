# TASK-027 Test Plan

Minimum verification:

1. Confirm the correct branch is checked out:
   - `nightly/2026-03-31-confidence-fix`
2. Run dependency / environment preparation if needed
3. Run:
   - `npm run build`
4. If API/config work is touched:
   - verify env loading path
   - verify provider/model/base URL formatting
   - attempt at least one real or near-real call when credentials allow
5. Record:
   - what passed
   - what was blocked
   - what Agent 1 should dispatch next
