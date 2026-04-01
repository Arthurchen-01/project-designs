# Execution Checklist for TASK-DEP-001: Machine 3 Health Check and Isolation Verification

1. Verify Machine 3 is powered on and accessible locally.
2. Check OS version and updates (local only, no net pulls).
3. Confirm no public network interfaces are active (e.g., disable Ethernet/WiFi to internet).
4. Run hardware diagnostics (CPU, RAM, disk space).
5. Ensure required local tools are installed (e.g., git, node, etc., from local repos).
6. Document current state in a report file.

Enforce: No commands that access public net.