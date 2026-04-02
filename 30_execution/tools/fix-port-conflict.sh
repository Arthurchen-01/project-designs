#!/bin/bash
# Fix port 3000 conflict on Machine 3 (42.192.56.101)
# Run via: sshpass -p 'PASSWORD' ssh root@42.192.56.101 "bash -s" < fix-port-conflict.sh

set -e

echo "=== Phase 1: Kill all next dev processes ==="
# Find PIDs before killing
PIDS=$(ps aux | grep '[n]ext dev' | awk '{print $2}')
if [ -n "$PIDS" ]; then
    echo "Killing next dev PIDs: $PIDS"
    kill -9 $PIDS 2>/dev/null || true
    sleep 2
fi

echo "=== Phase 2: Verify port 3000 is free ==="
if ss -tlnp 2>/dev/null | grep -q ':3000 '; then
    echo "Port 3000 still held, force killing:"
    fuser -k -9 3000/tcp 2>/dev/null || true
    sleep 3
fi

echo "=== Phase 3: Update systemd to port 3001 ==="
systemctl stop ap-tracker 2>/dev/null || true

cat > /etc/systemd/system/ap-tracker.service << 'EOF'
[Unit]
Description=AP Tracker Next.js Production Server
After=network.target
StartLimitBurst=5
StartLimitIntervalSec=300

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/ap-tracker
ExecStartPre=/home/ubuntu/ap-tracker/pre-start.sh
ExecStart=/home/ubuntu/ap-tracker/node_modules/.bin/next start -p 3001
TimeoutStopSec=15
KillMode=mixed
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/home/ubuntu/ap-tracker/.env

[Install]
WantedBy=multi-user.target
EOF

cat > /home/ubuntu/ap-tracker/pre-start.sh << 'EOF'
#!/bin/bash
# Kill any process holding port 3001 before starting
fuser -k 3001/tcp 2>/dev/null || true
pkill -f 'next dev' 2>/dev/null || true
sleep 1
exit 0
EOF
chmod +x /home/ubuntu/ap-tracker/pre-start.sh

echo "=== Phase 4: Update nginx to proxy to 3001 ==="
for f in /etc/nginx/sites-enabled/*; do
    [ -f "$f" ] && sed -i 's/127.0.0.1:3000/127.0.0.1:3001/g; s/localhost:3000/localhost:3001/g' "$f"
done
nginx -t 2>&1 && nginx -s reload 2>/dev/null || true

echo "=== Phase 5: Start service ==="
systemctl daemon-reload
systemctl reset-failed ap-tracker
systemctl start ap-tracker
sleep 8

echo "=== Phase 6: Verify ==="
systemctl status ap-tracker --no-pager 2>/dev/null | head -10 || true
echo "RESTART_COUNT=$(systemctl show ap-tracker -p NRestarts 2>/dev/null)"
echo "HEALTH:$(curl -s http://localhost:3001/api/health 2>/dev/null)"
echo "HTTPS:$(curl -s -o /dev/null -w '%{http_code}' https://samuraiguan.cloud/ 2>/dev/null)"
echo "PORT_3001:$(ss -tlnp 2>/dev/null | grep 3001 || echo 'LISTENING')"
echo "PORT_3000:$(ss -tlnp 2>/dev/null | grep 3000 || echo 'free')"
echo "PROCESSES:$(ps aux | grep '[n]ext' | head -3)"
