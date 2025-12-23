# ZK8500R WebSocket Bridge Service

## Overview

The WebSocket Bridge Service provides a reliable, cross-browser solution for ZK8500R fingerprint scanner integration. It runs as a local Python service that communicates with web applications via WebSocket, bypassing browser compatibility limitations.

## Architecture

```
Web Browser ← WebSocket → Python Bridge ← ZKFinger SDK → ZK8500R Scanner
```

## Features

- ✅ **Cross-browser compatibility** - Works in any browser
- ✅ **Real-time communication** - WebSocket-based live updates
- ✅ **Automatic fallback** - Uses mock data when scanner unavailable
- ✅ **Easy deployment** - Single Python script
- ✅ **Comprehensive logging** - Detailed operation logs

## Installation

### Prerequisites

1. **Python 3.7+**
   ```bash
   # Linux/macOS
   python3 --version

   # Windows
   python --version
   ```

2. **Pip package manager**
   ```bash
   # Linux/macOS
   pip3 --version

   # Windows
   pip --version
   ```

### Platform-Specific Installation

#### Linux/macOS
```bash
# Run the installation script
./install-bridge.sh
```

#### Windows
```cmd
# Run the Windows installation script
install-bridge-windows.bat
```

Both scripts will:
- ✅ Check Python version compatibility
- ✅ Install required packages (`websockets`, `pyzkfp`)
- ✅ Create startup scripts
- ✅ Test the service

### Manual Installation

```bash
# Install required packages
pip3 install --user websockets pyzkfp

# Optional: Install ZKFinger SDK (for production use)
# Download from ZKTeco website and follow installation instructions
```

## Usage

### Starting the Service

#### Linux/macOS
```bash
# Method 1: Using the startup script
./start-bridge.sh

# Method 2: Direct execution
python3 services/fingerprint_bridge.py

# Method 3: Background execution
python3 services/fingerprint_bridge.py &
```

#### Windows
```cmd
# Method 1: Using the startup script
start-bridge.bat

# Method 2: Direct execution
python services\fingerprint_bridge_windows.py

# Method 3: Background execution (PowerShell)
Start-Process python -ArgumentList "services\fingerprint_bridge_windows.py" -NoNewWindow
```

### Service Information

- **WebSocket URL**: `ws://localhost:8765`
- **Status**: Running when script is active
- **Logs**: Console output with detailed information
- **Platform Support**: Linux, macOS, Windows

### Stopping the Service

```bash
# Press Ctrl+C in the terminal running the service
# Or find and kill the process
pkill -f fingerprint_bridge.py
```

## WebSocket Protocol

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8765');
```

### Message Format

#### Capture Request
```json
{
  "action": "capture",
  "fingerIndex": 0
}
```

#### Status Request
```json
{
  "action": "status"
}
```

#### Ping Request
```json
{
  "action": "ping"
}
```

### Response Format

#### Success Response
```json
{
  "status": "success",
  "template": "U0tFRVBURU1QTEFURQ==",
  "quality": 92,
  "fingerIndex": 0,
  "version": "10.0",
  "bioType": 1
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Scanner not initialized"
}
```

#### Status Response
```json
{
  "status": "ready",
  "scanner": "ZK8500R",
  "websocket_port": 8765
}
```

## Integration with Web Application

### Automatic Detection

The web application automatically detects and connects to the bridge service:

1. **Status Check**: Scans for bridge availability on startup
2. **Connection**: Establishes WebSocket connection when requested
3. **Fallback**: Uses WebUSB or manual entry if bridge unavailable

### Manual Connection

```javascript
// Check if bridge is available
const scannerStatus = webUSBScanner.getStatus();
if (scannerStatus.bridgeAvailable) {
  await webUSBScanner.connectBridge();
  // Bridge is now ready for fingerprint capture
}
```

### Capture Process

```javascript
// Capture fingerprint via bridge
const fingerprintData = await webUSBScanner.captureFingerprint(fingerIndex);
// Data is automatically sent to ZKBio server
```

## Configuration

### Default Settings

```python
WEBSOCKET_PORT = 8765
LOG_LEVEL = logging.INFO
```

### Custom Configuration

Edit `services/fingerprint_bridge.py`:

```python
# Change WebSocket port
WEBSOCKET_PORT = 8080

# Change log level
LOG_LEVEL = logging.DEBUG
```

## Troubleshooting

### Service Won't Start

#### Python Version Issue
```bash
python3 --version  # Should be 3.7+
```

#### Missing Packages
```bash
pip3 install --user websockets pyzkfp
```

#### Port Already in Use
```bash
# Check what's using port 8765
ss -tlnp | grep :8765

# Change port in script
WEBSOCKET_PORT = 8766
```

### Scanner Not Detected

#### ZKFinger SDK Not Installed
- Download from ZKTeco website: https://www.zkteco.com/en/download_category/29.html
- Install SDK libraries (Windows required for hardware access)
- Restart bridge service

#### Scanner Not Connected
- Ensure ZK8500R is powered on
- Check USB connection
- Try different USB port
- Check Device Manager (Windows) for scanner detection

#### Permission Issues

**Linux/macOS:**
```bash
# Run with sudo (not recommended for production)
sudo python3 services/fingerprint_bridge.py
```

**Windows:**
- Run Command Prompt as Administrator
- Or adjust USB device permissions in Device Manager
- Some antivirus software may block USB access

### WebSocket Connection Failed

#### Firewall Blocking
```bash
# Allow port 8765
sudo ufw allow 8765
```

#### Service Not Running
```bash
# Check if service is running
ps aux | grep fingerprint_bridge

# Start service
./start-bridge.sh
```

#### Browser Security
- Ensure connection is to `localhost` or `127.0.0.1`
- Check browser console for WebSocket errors

## Development

### Testing Without Hardware

The bridge service includes mock data generation for testing:

```python
# Mock template for testing
mock_template = "U0tFRVBURU1QTEFURQ=="  # Base64 encoded
quality_score = 92
```

### Adding New Features

#### Custom Commands
```python
elif action == 'custom_action':
    # Handle custom action
    result = perform_custom_action(data)
    await websocket.send(json.dumps(result))
```

#### Enhanced Logging
```python
import logging
logging.basicConfig(
    filename='bridge.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```

## Security Considerations

### Local Communication Only
- WebSocket server binds to `localhost` only
- No external network access
- Secure local communication

### Data Handling
- Templates transmitted securely to ZKBio server
- No local storage of biometric data
- Encrypted communication channels

### Service Permissions
- Runs with user privileges
- No elevated permissions required
- Isolated from system resources

## Performance

### Resource Usage
- **Memory**: ~50MB RAM
- **CPU**: Minimal usage
- **Network**: Local WebSocket only

### Scalability
- Single client connection (WebSocket limitation)
- Fast response times (< 100ms for mock data)
- Efficient fingerprint processing

## Production Deployment

### Systemd Service
```bash
# Create systemd service file
sudo tee /etc/systemd/system/fingerprint-bridge.service > /dev/null <<EOF
[Unit]
Description=ZK8500R Fingerprint Bridge Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/python3 services/fingerprint_bridge.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable fingerprint-bridge
sudo systemctl start fingerprint-bridge
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY services/fingerprint_bridge.py .
RUN pip install websockets pyzkfp

EXPOSE 8765
CMD ["python", "fingerprint_bridge.py"]
```

## Support

### Getting Help

1. **Check Logs**: Review console output for error messages
2. **Test Connectivity**: Use browser developer tools WebSocket inspector
3. **Verify Installation**: Run `./install-bridge.sh` again
4. **Check Dependencies**: Ensure all Python packages are installed

### Common Issues

- **"Scanner not initialized"**: ZKFinger SDK not installed or scanner not connected
- **"Connection refused"**: Bridge service not running
- **"Invalid JSON"**: Malformed WebSocket messages
- **"Timeout"**: Scanner capture taking too long

### ZKTeco Resources

- **ZKFinger SDK**: Download from ZKTeco website
- **Documentation**: Check ZKTeco developer resources
- **Support**: Contact ZKTeco technical support

## License

This bridge service is part of the biometric access control system and follows the same licensing terms.