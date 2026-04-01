# Test Plan for TASK-DEP-001

1. Validate isolation: Attempt ping to external site (should fail).
2. Check resource usage: Ensure >50% free disk, RAM.
3. Verify tools: Run version commands (e.g., node -v).
4. Pass if all checks succeed without net access.