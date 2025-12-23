# Smart Fingerprint Capture System

## Overview

The Smart Fingerprint Capture System provides a seamless, one-click fingerprint capture experience that automatically handles platform detection, service management, and device connectivity.

## How It Works

### 1. Platform Detection
The system automatically detects your operating system:
- **Windows**: Uses `fingerprint_bridge_windows.py`
- **Linux/macOS**: Uses `fingerprint_bridge.py`
- **WebUSB Browsers**: Direct USB connection (Chrome/Edge/Opera)

### 2. Service Management
**Automatic Service Lifecycle:**
- **Start**: Launches bridge service when capture begins
- **Monitor**: Tracks service health and connection status
- **Stop**: Automatically cleans up services after capture

### 3. Capture Process
**User Experience:**
1. Click "Smart Capture" button
2. System detects platform and available methods
3. Services start automatically
4. Connection established
5. User guided through capture process
6. Services stop automatically
7. Template uploaded to ZKBio server

## Usage

### Basic Usage
```tsx
import SmartCaptureButton from '../components/SmartCaptureButton';

<SmartCaptureButton
  fingerIndex={0}
  onCaptureSuccess={(data) => {
    // Handle successful capture
    console.log('Captured:', data);
  }}
  onCaptureError={(error) => {
    // Handle errors
    console.error('Capture failed:', error);
  }}
/>
```

### Advanced Usage
```tsx
<SmartCaptureButton
  fingerIndex={1} // Right index finger
  onCaptureSuccess={handleFingerprintData}
  onCaptureError={handleCaptureError}
  disabled={isProcessing}
  className="custom-button-styles"
/>
```

## API Reference

### SmartCaptureButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fingerIndex` | `number` | `0` | Which finger to capture (0-9) |
| `onCaptureSuccess` | `(data: FingerprintData) => void` | - | Called when capture succeeds |
| `onCaptureError` | `(error: Error) => void` | - | Called when capture fails |
| `disabled` | `boolean` | `false` | Disable the capture button |
| `className` | `string` | `''` | Additional CSS classes |

### FingerprintData Interface
```typescript
interface FingerprintData {
  template: string;        // Base64 encoded template
  quality: number;         // Quality score (0-100)
  capturedAt: string;      // ISO timestamp
  bioType: number;         // Biometric type (1 = fingerprint)
  version: string;         // Template version
  templateNo: string;      // Finger index as string
}
```

### CaptureStatus Interface
```typescript
interface CaptureStatus {
  status: 'idle' | 'detecting' | 'starting_services' | 'connecting' | 'capturing' | 'processing' | 'completed' | 'error';
  message: string;
  progress: number;        // 0-100
  platform?: 'windows' | 'linux' | 'macos' | 'unknown';
  serviceStarted?: boolean;
  servicePid?: number;
}
```

## Platform-Specific Behavior

### Windows
- **Bridge Service**: `fingerprint_bridge_windows.py`
- **Installation**: `install-bridge-windows.bat`
- **ZKFinger SDK**: Native Windows support
- **Service Management**: Windows process management

### Linux/macOS
- **Bridge Service**: `fingerprint_bridge.py`
- **Installation**: `./install-bridge.sh`
- **ZKFinger SDK**: Limited support (mock mode)
- **Service Management**: Unix process management

### WebUSB Browsers
- **Direct Connection**: No bridge service needed
- **Browser Support**: Chrome 61+, Edge 79+, Opera 48+
- **Fallback**: Bridge service if WebUSB fails

## Error Handling

### Common Errors

#### "Platform not supported"
**Cause**: Unknown operating system
**Solution**: Manual template entry or WebUSB

#### "Bridge service failed to start"
**Cause**: Python dependencies missing or service conflict
**Solution**: Check installation and port availability

#### "No capture method available"
**Cause**: Neither bridge nor WebUSB available
**Solution**: Install bridge service or use WebUSB browser

#### "Scanner not connected"
**Cause**: Hardware not detected
**Solution**: Check USB connection and scanner power

### Recovery Strategies

1. **Automatic Fallback**: System tries alternative methods
2. **User Guidance**: Clear error messages with solutions
3. **Manual Override**: Option to use manual template entry
4. **Service Restart**: Automatic cleanup and restart

## Configuration

### Environment Variables
```bash
# Bridge service port (default: 8765)
WEBSOCKET_PORT=8765

# Service timeout (default: 30 seconds)
CAPTURE_TIMEOUT=30000
```

### Custom Bridge Scripts
```bash
# Use custom bridge script
BRIDGE_SCRIPT="/path/to/custom/bridge.py"
BRIDGE_COMMAND="python3"
BRIDGE_ARGS=["/path/to/custom/bridge.py"]
```

## Troubleshooting

### Service Won't Start
```bash
# Check Python installation
python3 --version

# Check dependencies
pip3 list | grep websockets
pip3 list | grep pyzkfp

# Check port availability
netstat -tlnp | grep :8765
```

### Capture Fails
```bash
# Check bridge service logs
tail -f /tmp/fingerprint_bridge.log

# Test WebSocket connection
websocat ws://localhost:8765
```

### WebUSB Issues
```bash
# Check browser WebUSB support
navigator.usb !== undefined

# Check USB device permissions
# Chrome: chrome://settings/content/usbDevices
```

## Performance

### Capture Times
- **WebUSB**: 2-5 seconds
- **Bridge Service**: 3-8 seconds
- **Service Start**: 2-3 seconds (one-time)

### Resource Usage
- **Memory**: ~50MB per bridge service
- **CPU**: Minimal during capture
- **Network**: Local WebSocket only

## Security

### Data Protection
- Templates encrypted during transmission
- No local storage of biometric data
- Secure WebSocket connections
- Service isolation

### Access Control
- User permission required for USB access
- Service runs with minimal privileges
- Automatic cleanup prevents data leakage

## Development

### Testing
```bash
# Mock capture for testing
npm run test:capture

# Integration tests
npm run test:integration
```

### Debugging
```bash
# Enable debug logging
DEBUG=fingerprint:* npm run dev

# Check service status
curl http://localhost:3000/api/fingerprint/status
```

### Custom Implementation
```typescript
// Extend capture manager
class CustomCaptureManager extends FingerprintCaptureManager {
  async customCaptureMethod() {
    // Custom capture logic
  }
}
```

## Support

### Getting Help
1. Check browser console for errors
2. Verify bridge service is running
3. Test WebSocket connection
4. Check USB device permissions

### Platform-Specific Support
- **Windows**: ZKFinger SDK full support
- **Linux**: Limited hardware support (mock mode)
- **macOS**: Limited hardware support (mock mode)
- **WebUSB**: Chrome/Edge/Opera full support

### Compatibility Matrix

| Platform | Bridge Service | WebUSB | Manual Entry |
|----------|----------------|--------|--------------|
| Windows | ✅ Full | ✅ Chrome/Edge | ✅ Always |
| Linux | ⚠️ Mock mode | ✅ Chrome/Edge | ✅ Always |
| macOS | ⚠️ Mock mode | ✅ Chrome/Edge | ✅ Always |

**Legend**: ✅ Full support, ⚠️ Limited support, ❌ Not supported

## Future Enhancements

- **Multi-device support**: Multiple scanners
- **Batch capture**: Multiple fingers at once
- **Quality optimization**: Advanced quality algorithms
- **Cloud integration**: Remote scanner support
- **Mobile support**: React Native integration