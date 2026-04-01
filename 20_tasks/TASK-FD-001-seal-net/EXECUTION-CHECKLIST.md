# Execution Checklist for TASK-FD-001: Seal Off Public Net Access

**Objective:** Audit and eliminate all potential public network access in the AP Tracking system, ensuring all operations are local to machine 3.

1. **Code Audit:**
   - Scan backend code for any HTTP requests to external URLs (e.g., OpenRouter, public APIs).
   - Remove or comment out any such calls.
   - Replace with local MIMO endpoints.

2. **Configuration Check:**
   - Review config files for API keys, URLs pointing to public services.
   - Remove all public API keys; ensure no environment variables reference external services.

3. **Dependency Audit:**
   - List all dependencies and check for telemetry or auto-update features.
   - Disable or remove problematic dependencies.

4. **Logging and Debugging:**
   - Ensure logs are written locally only; disable any remote logging.

5. **Enforce Local Model:**
   - Update model call logic to use only local MIMO on machine 3.

**Notes:** All actions must be performed locally without any network access. Use local tools for scanning.
