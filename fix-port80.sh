#!/bin/bash

echo "=== Network Access Fix - Port 80 ==="
echo "This will run the server on port 80 (HTTP default)"
echo "Port 80 typically bypasses firewall restrictions"
echo ""

# Check if port 80 is available
echo "Checking port 80 availability..."
if ss -tlnp | grep -q ":80 "; then
    echo "❌ Port 80 is already in use"
    ss -tlnp | grep ":80 "
    exit 1
else
    echo "✅ Port 80 is available"
fi

echo ""
echo "Starting server on port 80..."
echo "This requires sudo privileges for port 80"
echo ""
echo "Run this command:"
echo "sudo PORT=80 npm run dev:network"
echo ""
echo "Then access from client:"
echo "http://172.20.10.10 (no port needed)"
echo ""
echo "If sudo doesn't work in your environment,"
echo "try disabling the firewall instead:"
echo "sudo ufw disable"