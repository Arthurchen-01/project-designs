# Test Plan for TASK-FD-002: Local MIMO Model Setup

1. **Availability Test:**
   - Ping local MIMO endpoint.
   - Expected: Responds.

2. **Sample Inference:**
   - Send test input to MIMO via local call.
   - Expected: Valid response, no net access.

3. **Error Handling:**
   - Test with invalid input.
   - Expected: Graceful error.
