# Test Plan for TASK-FD-001: Seal Off Public Net Access

**Objective:** Verify no public network access is possible.

1. **Network Monitoring Test:**
   - Run the backend service on machine 3.
   - Use local tools (e.g., tcpdump, wireshark) to monitor outbound traffic.
   - Expected: No packets to public IPs.

2. **Attempt External Call:**
   - Trigger functions that previously called external services.
   - Expected: Calls fail or redirect to local, no outbound request.

3. **Dependency Test:**
   - Start service and check for any auto-fetches or telemetry.
   - Expected: None.

4. **Regression:**
   - After changes, ensure core functions still work locally.

**Enforcement:** All tests local; disconnect public net if needed for verification.
