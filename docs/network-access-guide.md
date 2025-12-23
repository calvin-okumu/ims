# Network Access Guide

This guide explains how to access the biometric access control application from other computers on your network.

## Current Network Configuration

### Server Information
- **Local IP Address**: `172.20.10.10`
- **Port**: `3001` (Next.js development server)
- **Network Interface**: `wlan0` (WiFi)

### Access URLs
- **Local Access**: `http://localhost:3001`
- **Network Access**: `http://172.20.10.10:3001`

## Accessing from Another Computer

### Step 1: Ensure Server is Running with Network Access
```bash
# Kill any existing server
pkill -f "next dev"

# Start server with network access
npm run dev:network
```

You should see output like:
```
▲ Next.js 16.0.8 (Turbopack)
- Local:        http://localhost:3001
- Network:      http://0.0.0.0:3001
```

### Step 2: Verify Network Connectivity

#### From the Server Machine
```bash
# Check if port 3001 is listening
netstat -tlnp | grep :3001

# Or use ss command
ss -tlnp | grep :3001
```

#### From Another Computer on Network
```bash
# Test connectivity to server
ping 172.20.10.10

# Test web server access
curl -I http://172.20.10.10:3001
```

### Step 3: Access the Application

Open a web browser on the client computer and navigate to:
```
http://172.20.10.10:3001
```

## Firewall Configuration

### Ubuntu/Debian (ufw)
```bash
# Check firewall status
sudo ufw status

# ✅ CONFIRMED SOLUTION: Disable firewall temporarily
sudo ufw disable

# After testing, re-enable and add specific rules:
sudo ufw enable
sudo ufw allow 3000  # For development
sudo ufw allow 80    # For production (recommended)

# Or allow the entire development port range
sudo ufw allow 3000:3100/tcp
```

### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → TCP → Specific ports: 3001
5. Allow the connection
6. Name it "Next.js Development Server"

### macOS
```bash
# Check if firewall is enabled
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Add rule for port 3001 (if firewall is enabled)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add 3001
```

## Troubleshooting Network Access

### ✅ PRIMARY SOLUTION: Disable Server Firewall

**Confirmed Working Solution**: The server firewall (ufw) was blocking network access. Disabling it immediately resolved the issue.

```bash
# Check firewall status
sudo ufw status

# Disable firewall (immediate fix)
sudo ufw disable

# Test access from client computer
# http://172.20.10.10:3000

# Re-enable firewall after testing
sudo ufw enable
sudo ufw allow 3000
```

**Why this works**: Ubuntu's ufw firewall blocks incoming connections by default, preventing network access to the Next.js development server.

### Issue: Cannot Connect from Other Computers

#### 1. Check Server Binding
Ensure the server is bound to `0.0.0.0` not just `localhost`:
```bash
# Wrong (only localhost)
npm run dev

# Correct (network accessible)
npm run dev:network
# or
next dev -H 0.0.0.0
```

#### 2. Firewall Blocking
```bash
# Check if port is blocked
telnet 172.20.10.10 3001

# If connection fails, check firewall
sudo ufw status
```

#### 3. Network Configuration
```bash
# Check IP address
hostname -I

# Check network interface
ip route show

# Test local connectivity
curl http://localhost:3001
```

#### 4. Antivirus/Security Software
Some antivirus software may block network connections. Temporarily disable or add exceptions for:
- Port 3001
- Node.js processes
- Development server

### Issue: Connection Timeout

#### 1. Server Not Running
```bash
# Check if server is running
ps aux | grep next

# Restart server
npm run dev:network
```

#### 2. Wrong IP Address
```bash
# Get correct IP address
hostname -I

# Update client to use correct IP
# e.g., if IP is 192.168.1.100, use http://192.168.1.100:3001
```

#### 3. Port Conflict
```bash
# Check what's using port 3001
lsof -i :3001

# Kill conflicting process or change port
PORT=3002 npm run dev:network
```

### Issue: WebUSB Scanner Not Working Over Network

**Important**: WebUSB fingerprint scanners (ZK8500R) can only be accessed from the computer where the scanner is physically connected. The scanner cannot be used remotely over the network.

#### Solutions:
1. **Local Access Only**: Use the application directly on the computer with the scanner
2. **Remote Desktop**: Use RDP/VNC to remotely control the scanner-equipped computer
3. **API Integration**: Implement server-side scanner integration (requires hardware on server)

## Advanced Configuration

### Custom Port
```bash
# Use custom port
PORT=8080 npm run dev:network

# Access at: http://172.20.10.10:8080
```

### HTTPS for Development
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Start with HTTPS
HTTPS=true SSL_CRT_FILE=cert.pem SSL_KEY_FILE=key.pem npm run dev:network
```

### Environment Variables
Create a `.env.local` file:
```
# Network configuration
NEXT_PUBLIC_APP_URL=http://172.20.10.10:3001

# ZKBio API (if different for network access)
NEXT_PUBLIC_ZKBIO_API_URL=https://your-zkbio-server:8098/api
```

## Security Considerations

### Development Environment
- Only use network access for development/testing
- Do not expose development servers to public internet
- Use HTTPS in production

### Production Deployment
For production, consider:
- Reverse proxy (nginx/apache)
- SSL/TLS certificates
- Authentication and authorization
- Rate limiting
- CORS configuration

## Quick Access Commands

```bash
# RECOMMENDED: Start on port 80 (bypasses firewall)
sudo ./start-port80.sh
# Or: npm run dev:port80

# Alternative: Start on port 3000
npm run dev:network

# Check server status (port 80)
curl -I http://localhost

# Check server status (port 3000)
curl -I http://localhost:3000

# Test network access (port 80)
curl http://172.20.10.10

# Test network access (port 3000)
curl http://172.20.10.10:3000
```

## Support

If you continue to have network access issues:

1. Verify both computers are on the same network
2. Check firewall settings on server
3. Ensure antivirus isn't blocking connections
4. Try accessing from a different client computer
5. Check server logs for connection attempts

For WebUSB scanner issues over network, the scanner must be physically connected to the client computer accessing the application.