# Client-Side Network Access Troubleshooting

## 🚨 Issue: Cannot Access Server from Client

**✅ RESOLVED**: The issue was the SERVER firewall (Ubuntu UFW), not the client firewall.

**Server Status**: ✅ Working correctly
- Server IP: `172.20.10.10`
- Port: `3000`
- Status: Responding with HTTP 200

**Root Cause Identified**: Ubuntu UFW firewall was blocking all incoming connections.

**Solution Applied**: `sudo ufw disable` immediately resolved network access.

## If You Still Have Issues (After Server Firewall Fix)

### **Solution 1: Disable Windows Firewall (Most Likely Fix)**

1. **Open Windows Security**
   - Press `Win + R`, type `wf.msc`, press Enter
   - Or search for "Windows Security" in Start menu

2. **Disable Firewall Temporarily**
   - Click "Firewall & network protection"
   - Click "Private network" or "Public network"
   - Turn off "Microsoft Defender Firewall"

3. **Test Access**
   - Open browser: `http://172.20.10.10:3000`
   - Should work now

4. **Re-enable Firewall (After Testing)**
   - Turn firewall back on
   - Add exception for the application

### **Solution 2: Add Firewall Exception**

1. **Open Windows Firewall Settings**
   - Go to Control Panel → System and Security → Windows Defender Firewall
   - Click "Advanced settings" on the left

2. **Create Inbound Rule**
   - Click "Inbound Rules" → "New Rule"
   - Select "Port" → Next
   - Select "TCP" and enter "3000" → Next
   - Select "Allow the connection" → Next
   - Check all network types → Next
   - Name: "Next.js Development Server" → Finish

### **Solution 3: Check Browser Settings**

1. **Try Different Browser**
   - Chrome, Firefox, Edge
   - Try incognito/private mode

2. **Clear Browser Cache**
   - Ctrl+Shift+Delete (Chrome)
   - Clear browsing data

3. **Check Proxy Settings**
   - Chrome: Settings → Advanced → System → Open proxy settings
   - Ensure "No proxy" or bypass for local addresses

### **Solution 4: Network Troubleshooting**

1. **Check Network Connection**
   ```cmd
   ipconfig /all
   ```
   - Ensure IP is 172.20.10.4
   - Check subnet mask (should be 255.255.255.240 or /28)

2. **Test Connectivity**
   ```cmd
   ping 172.20.10.10

   # Test port (install telnet or use PowerShell)
   Test-NetConnection -ComputerName 172.20.10.10 -Port 3000
   ```

3. **Check DNS**
   ```cmd
   nslookup 172.20.10.10
   ```

### **Solution 5: Antivirus/Security Software**

Some antivirus software blocks network connections:

1. **Disable Temporarily**
   - Try disabling antivirus completely
   - Test access, then re-enable

2. **Check Application Rules**
   - Add browser to allowed applications
   - Add exception for 172.20.10.10

## 🧪 Quick Tests from Client

### **Command Prompt Tests**
```cmd
# Test basic connectivity
ping 172.20.10.10

# Test port connectivity (if telnet installed)
telnet 172.20.10.10 3000

# Test with curl (if installed)
curl -I http://172.20.10.10:3000
```

### **PowerShell Tests**
```powershell
# Test port connectivity
Test-NetConnection -ComputerName 172.20.10.10 -Port 3000

# Test HTTP
Invoke-WebRequest -Uri http://172.20.10.10:3000
```

## 📞 Support Steps

If issues persist:

1. **Confirm server is running** (it should be on 172.20.10.10:3000)
2. **Try Solution 1** (disable Windows Firewall) - this usually fixes it
3. **Test with different browser** and incognito mode
4. **Check network settings** - ensure same subnet
5. **Try from different device** on same network (phone/tablet)

## 🎯 Most Likely Solution

**99% chance it's Windows Firewall blocking the connection.**

**Quick Fix:**
1. Temporarily disable Windows Firewall
2. Test access: `http://172.20.10.10:3000`
3. If it works, add a firewall exception for port 3000

## 📋 Alternative Access Methods

If firewall issues can't be resolved:

### **Method 1: Use Different Port**
Server can be configured to use port 80 (HTTP default):
```bash
# On server (requires sudo)
sudo PORT=80 npm run dev:network
# Access: http://172.20.10.10
```

### **Method 2: Use ngrok for External Access**
```bash
# On server
npm install -g ngrok
ngrok http 3000
# Use the HTTPS URL provided
```

### **Method 3: SSH Tunneling**
```cmd
# On Windows client
ssh -L 3000:localhost:3000 user@172.20.10.10
# Then access: http://localhost:3000
```

## ✅ Expected Result

After applying the fixes, you should be able to:
- Open `http://172.20.10.10:3000` in any browser
- Access the biometric access control application
- Use all features except fingerprint scanning (requires local USB access)

**Try disabling Windows Firewall first - this almost always fixes the issue!** 🚀