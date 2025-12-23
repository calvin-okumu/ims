#!/bin/bash

echo "=== Network Access Fix Script ==="
echo "This script will help configure firewall for network access"
echo ""

# Check current status
echo "1. Checking firewall status..."
sudo ufw status

echo ""
echo "2. Checking listening ports..."
ss -tlnp | grep :3000

echo ""
echo "3. Testing local connectivity..."
curl -I http://localhost:3000 2>/dev/null | head -1

echo ""
echo "4. Testing network connectivity..."
curl -I http://172.20.10.10:3000 2>/dev/null | head -1

echo ""
echo "=== Firewall Configuration ==="
echo "Run these commands if firewall is blocking:"
echo "sudo ufw allow 3000"
echo "sudo ufw allow from 172.20.10.0/28 to any port 3000"
echo ""
echo "Or disable firewall temporarily for testing:"
echo "sudo ufw disable"
echo ""
echo "=== Alternative Solutions ==="
echo "1. Try accessing from client: http://172.20.10.10:3000"
echo "2. If still blocked, the firewall needs to be configured"
echo "3. Check Windows Firewall on client computer"