"""
Windows-Compatible WebSocket Fingerprint Bridge Service

This service provides a WebSocket interface for fingerprint capture on Windows,
bridging the web application with fingerprint scanners.

Usage:
    python fingerprint_bridge_windows.py

WebSocket Protocol:
    -> {"action": "capture", "fingerIndex": 0}
    <- {"status": "success", "template": "base64...", "quality": 95}

Requirements:
    - Python 3.7+
    - websockets library (pip install websockets)
"""

import asyncio
import json
import logging
import sys
import signal
import platform
import time
from typing import Dict, Any, Optional

# Try to import websockets
try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    print("websockets not available - install with: pip install websockets")
    WEBSOCKETS_AVAILABLE = False

# For now, we'll use mock mode since SDK integration needs more work
# TODO: Implement real ZKFinger SDK integration
print("⚠ Running in mock mode - real SDK integration needed")
print("   Install ZKFinger SDK from ZKTeco and update this code")

PYZK_AVAILABLE = False
PYZKFP_AVAILABLE = False

# Configuration
WEBSOCKET_PORT = 8765
LOG_LEVEL = logging.INFO

# Global variables
server = None
scanner = None
scanner = None

class WindowsFingerprintBridge:
    def __init__(self):
        self.running = True
        self.scanner_connected = False
        print("✓ Windows Fingerprint Bridge initialized")
        print(f"✓ Platform: {platform.system()}")
        print(f"✓ WebSocket port: {WEBSOCKET_PORT}")

        # Initialize scanner if SDK is available
        if PYZKFP_AVAILABLE:
            self.initialize_scanner()
        else:
            print("⚠ Running in mock mode (ZKFinger SDK not available)")

    def initialize_scanner(self):
        """Initialize the scanner (mock mode for now)"""
        print("🔧 Initializing scanner in mock mode...")
        print("   TODO: Implement real ZKFinger SDK integration")
        print("   1. Install ZKFinger SDK from ZKTeco")
        print("   2. Find correct Python wrapper library")
        print("   3. Update this code to use real device")

        # For now, simulate device detection
        self.scanner_connected = False  # Set to False since we can't detect real device yet

    def get_device_status(self) -> Dict[str, Any]:
        """Get current device status"""
        return {
            "sdk_available": PYZKFP_AVAILABLE,
            "device_connected": self.scanner_connected,
            "platform": platform.system(),
            "mock_mode": not (PYZKFP_AVAILABLE and self.scanner_connected)
        }

    async def handle_connection(self, websocket, path):
        """Handle WebSocket connection"""
        print(f"✓ Client connected from {websocket.remote_address}")

        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    action = data.get('action')

                    if action == 'capture':
                        finger_index = data.get('fingerIndex', 0)
                        print(f"📸 Capturing fingerprint for finger {finger_index}...")

                        result = await self.capture_fingerprint(finger_index)

                        await websocket.send(json.dumps(result))
                        print(f"✓ Sent capture result: {result['status']}")

                    elif action == 'status':
                        # Return device status
                        status_info = self.get_device_status()
                        await websocket.send(json.dumps({
                            "status": "info",
                            "device_status": status_info
                        }))
                        print(f"✓ Sent device status: {status_info}")

                    else:
                        await websocket.send(json.dumps({
                            "status": "error",
                            "message": f"Unknown action: {action}"
                        }))

                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        "status": "error",
                        "message": "Invalid JSON message"
                    }))
                except Exception as e:
                    print(f"✗ Error handling message: {e}")
                    await websocket.send(json.dumps({
                        "status": "error",
                        "message": str(e)
                    }))

        except websockets.exceptions.ConnectionClosed:
            print("✓ Client disconnected")
        except Exception as e:
            print(f"✗ Connection error: {e}")

    async def capture_fingerprint(self, finger_index: int = 0) -> Dict[str, Any]:
        """Capture fingerprint using real device or mock data"""
        print(f"Capturing fingerprint for finger {finger_index}...")

        # TODO: Implement real device capture
        # For now, always use mock capture since SDK integration is not complete

        # Fallback to mock capture
        print("Using mock fingerprint capture...")
        await asyncio.sleep(1.5)

        # Mock successful capture
        import base64
        mock_template_data = b"WindowsFingerprintTemplateData"
        mock_template = base64.b64encode(mock_template_data).decode('utf-8')
        quality_score = 88 + (finger_index * 2)

        return {
            "status": "success",
            "template": mock_template,
            "quality": min(100, quality_score),
            "fingerIndex": finger_index,
            "version": "10.0",
            "bioType": 1,
            "source": "mock_fallback",
            "platform": platform.system(),
            "message": f"Mock fingerprint captured for finger {finger_index} (device not available)"
        }

async def main():
    """Main WebSocket server"""
    if not WEBSOCKETS_AVAILABLE:
        print("✗ websockets library not available")
        print("Install with: pip install websockets")
        return

    print("🚀 Starting Windows Fingerprint Bridge Service")
    print("=" * 50)
    print(f"WebSocket Port: {WEBSOCKET_PORT}")
    print("Ready for connections...")
    print("Press Ctrl+C to stop")
    print()

    bridge = WindowsFingerprintBridge()
    server = None

    # Setup signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        print("\n🛑 Shutdown signal received...")
        bridge.running = False
        if server:
            server.close()

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        server = await websockets.serve(
            bridge.handle_connection,
            "localhost",
            WEBSOCKET_PORT
        )

        print(f"✓ WebSocket server started on ws://localhost:{WEBSOCKET_PORT}")

        # Keep the server running
        while bridge.running:
            await asyncio.sleep(1)

    except Exception as e:
        print(f"✗ Failed to start server: {e}")
        if "10048" in str(e):
            print("💡 Port 8765 is already in use. Try:")
            print("   1. Close other bridge services")
            print("   2. Kill process: netstat -ano | findstr :8765")
            print("   3. Or change WEBSOCKET_PORT in the script")
    finally:
        if server:
            server.close()
            print("✓ Server closed")

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=LOG_LEVEL, format='%(asctime)s - %(levelname)s - %(message)s')

    # Run the server
    asyncio.run(main())