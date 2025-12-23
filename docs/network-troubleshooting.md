# Network Access Troubleshooting Guide

## 🚨 Current Issue: Application Not Accessible from Network

### **Server Configuration**
- **IP Address**: `172.20.10.10`
- **Port**: `8080` (currently testing)
- **Binding**: `0.0.0.0` (all interfaces)

## 🔍 Step-by-Step Troubleshooting

### **Step 1: Verify Server is Running**
```bash
# Check if Next.js is running
ps aux | grep next

# Check listening ports
ss -tlnp | grep :8080

# Test local access
curl -I http://localhost:8080
```

### **Step 2: Check Network Configuration**
```bash
# Get IP addresses
hostname -I

# Check network routes
ip route show

# Check network interface status
ip addr show wlan0
```

### **Step 3: Test Network Connectivity**
```bash
# Test if server can reach itself
ping -c 3 172.20.10.10

# Test port accessibility
timeout 5 nc -zv 172.20.10.10 8080

# Test HTTP response
curl -I http://172.20.10.10:8080
```

### **Step 4: Firewall Check**
```bash
# Check UFW status (Ubuntu/Debian)
sudo ufw status

# If UFW is active, allow the port
sudo ufw allow 8080

# Check iptables rules
sudo iptables -L -n | grep 8080
```

### **Step 5: Client-Side Testing**
From the client computer trying to access the server:

```bash
# Test basic connectivity
ping 172.20.10.10

# Test port accessibility
telnet 172.20.10.10 8080

# Test in browser
# Open: http://172.20.10.10:8080
```

## 🛠️ Common Solutions

### **Solution 1: Disable Firewall Temporarily**
```bash
# Ubuntu/Debian
sudo ufw disable

# Test access, then re-enable
sudo ufw enable
```

### **Solution 2: Try Different Port**
```bash
# Kill current server
pkill -f "next dev"

# Start on port 3000
PORT=3000 npm run dev:network

# Or port 80 (requires sudo)
sudo PORT=80 npm run dev:network
```

### **Solution 3: Check Network Settings**
1. Ensure both computers are on the same WiFi network
2. Check if there are any VPNs interfering
3. Try disabling Windows Firewall on client
4. Check if antivirus is blocking connections

### **Solution 4: Router/Firewall Issues**
1. Check router firewall settings
2. Ensure port forwarding isn't needed (shouldn't be for same network)
3. Try accessing from a different device on the same network

## 📋 Quick Diagnostic Commands

### **On Server (172.20.10.10):**
```bash
# One-liner diagnostic
echo "=== Server Diagnostics ===" && \
echo "IP: $(hostname -I | awk '{print $1}')" && \
echo "Port 8080: $(ss -tlnp | grep :8080 || echo 'NOT LISTENING')" && \
echo "Firewall: $(sudo ufw status | grep Status || echo 'UFW not available')" && \
echo "Process: $(ps aux | grep next | grep -v grep || echo 'Server not running')"
```

### **On Client Computer:**
```bash
# Test connectivity
echo "=== Client Diagnostics ===" && \
echo "Ping: $(ping -c 1 172.20.10.10 | grep '1 received' || echo 'FAILED')" && \
echo "Port test: $(timeout 3 nc -zv 172.20.10.10 8080 2>&1 || echo 'FAILED')"
```

## 🔧 Alternative Access Methods

### **Method 1: Use ngrok (External Access)**
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 8080

# Use the provided HTTPS URL
```

### **Method 2: SSH Tunneling**
```bash
# On client computer
ssh -L 8080:localhost:8080 user@172.20.10.10

# Then access: http://localhost:8080
```

### **Method 3: Change Server Binding**
```bash
# Bind to specific interface
next dev -H 172.20.10.10

# Or try localhost only first
next dev
```

## 📞 Support Information

If issues persist:

1. **Run diagnostics** on both server and client
2. **Check network settings** - ensure same subnet
3. **Try different ports** - 3000, 8080, 5000
4. **Test with different devices** - phone, tablet, another computer
5. **Check router settings** - firewall, access restrictions

## 🚀 Quick Fix Attempts

### **Attempt 1: Different Port**
```bash
pkill -f "next dev"
PORT=3000 npm run dev:network
# Access: http://172.20.10.10:3000
```

### **Attempt 2: Disable Firewall**
```bash
sudo ufw disable
# Test access, then: sudo ufw enable
```

### **Attempt 3: Check Network**
```bash
# On client, check if you can reach the server
ping 172.20.10.10
nslookup 172.20.10.10
```

**Most likely causes:**
1. **Firewall blocking** - UFW or Windows Firewall
2. **Wrong IP address** - Client using different IP
3. **Different networks** - Devices not on same WiFi
4. **Port conflict** - Something else using port 8080