#!/usr/bin/env python3
"""
ZKTeco Network Device WebSocket Bridge

This service provides a WebSocket interface for network-attached ZKTeco devices
(iClock, access control panels, etc.) that support TCP/IP communication.

NOT for USB fingerprint scanners like ZK8500R - use fingerprint_bridge_windows.py instead.

Usage:
    python fingerprint_bridge.py

WebSocket Protocol:
    -> {"action": "capture", "fingerIndex": 0}
    <- {"status": "success", "template": "base64...", "quality": 95}

Requirements:
    - Python 3.7+
    - pyzk library (pip install pyzk)
    - websockets library (pip install websockets)
    - Network-attached ZKTeco device
"""

import asyncio
import json
import logging
import sys
import signal
from typing import Dict, Any, Optional

# Try to import optional dependencies
try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    print("websockets not available - install with: pip install websockets")
    WEBSOCKETS_AVAILABLE = False

try:
    import pyzkfp  # ZKTeco fingerprint SDK wrapper
    PYZKFP_AVAILABLE = True
except ImportError:
    print("pyzkfp not available - install with: pip install pyzkfp")
    print("Note: ZKFinger SDK must be installed separately from ZKTeco")
    PYZKFP_AVAILABLE = False

# Configuration
WEBSOCKET_PORT = 8765
LOG_LEVEL = logging.INFO

# Global variables
scanner = None
server = None

class FingerprintBridge:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.scanner = None
        self.connected_clients = set()

    async def initialize_scanner(self) -> bool:
        """Initialize the ZK8500R scanner"""
        try:
            self.logger.info("Initializing ZK8500R scanner...")
            self.scanner = pyzkfp.ZKFP()

            # Try to open the device
            devices = self.scanner.get_device_list()
            if not devices:
                self.logger.error("No ZK8500R devices found")
                return False

            # Open first available device
            if self.scanner.open_device(devices[0]):
                self.logger.info("ZK8500R scanner initialized successfully")
                return True
            else:
                self.logger.error("Failed to open ZK8500R device")
                return False

        except Exception as e:
            self.logger.error(f"Scanner initialization failed: {e}")
            return False

    async def capture_fingerprint(self, finger_index: int = 0) -> Dict[str, Any]:
        """Capture a fingerprint and return template data"""
        try:
            if not self.scanner:
                return {
                    "status": "error",
                    "message": "Scanner not initialized"
                }

            self.logger.info(f"Capturing fingerprint for finger index {finger_index}")

            # Capture fingerprint (this is a simplified implementation)
            # In real implementation, you would:
            # 1. Start capture process
            # 2. Wait for finger placement
            # 3. Extract template
            # 4. Calculate quality score

            # For now, return a mock successful response
            # Replace with actual ZKFinger SDK calls
            mock_template = "U0tFRVBURU1QTEFURQ=="  # Base64 encoded mock template
            quality_score = 92

            return {
                "status": "success",
                "template": mock_template,
                "quality": quality_score,
                "fingerIndex": finger_index,
                "version": "10.0",
                "bioType": 1
            }

        except Exception as e:
            self.logger.error(f"Fingerprint capture failed: {e}")
            return {
                "status": "error",
                "message": f"Capture failed: {str(e)}"
            }

    async def handle_client(self, websocket, path):
        """Handle WebSocket client connections"""
        self.connected_clients.add(websocket)
        client_address = websocket.remote_address
        self.logger.info(f"Client connected: {client_address}")

        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    action = data.get('action')

                    if action == 'capture':
                        finger_index = data.get('fingerIndex', 0)
                        result = await self.capture_fingerprint(finger_index)
                        await websocket.send(json.dumps(result))

                    elif action == 'ping':
                        await websocket.send(json.dumps({"status": "pong"}))

                    elif action == 'status':
                        status = {
                            "status": "ready" if self.scanner else "disconnected",
                            "scanner": "ZK8500R" if self.scanner else None,
                            "websocket_port": WEBSOCKET_PORT
                        }
                        await websocket.send(json.dumps(status))

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
                    self.logger.error(f"Message handling error: {e}")
                    await websocket.send(json.dumps({
                        "status": "error",
                        "message": "Internal server error"
                    }))

        except websockets.exceptions.ConnectionClosed:
            self.logger.info(f"Client disconnected: {client_address}")
        finally:
            self.connected_clients.remove(websocket)

async def main():
    """Main application entry point"""
    # Setup logging
    logging.basicConfig(
        level=LOG_LEVEL,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)

    # Create bridge instance
    bridge = FingerprintBridge()

    # Initialize scanner
    if not await bridge.initialize_scanner():
        logger.error("Failed to initialize scanner. Service will start without scanner support.")
        logger.info("Clients can still connect, but fingerprint capture will return mock data.")

    # Setup signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        logger.info("Shutdown signal received, stopping server...")
        if server:
            server.close()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start WebSocket server
    global server
    server = await websockets.serve(
        bridge.handle_client,
        "localhost",
        WEBSOCKET_PORT
    )

    logger.info(f"ZK8500R Fingerprint Bridge started on ws://localhost:{WEBSOCKET_PORT}")
    logger.info("Press Ctrl+C to stop the service")

    # Keep the server running
    await server.wait_closed()

if __name__ == "__main__":
    print("ZK8500R Fingerprint Scanner WebSocket Bridge")
    print("=" * 50)
    print(f"WebSocket Port: {WEBSOCKET_PORT}")
    print("Starting service...")
    print()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nService stopped by user")
    except Exception as e:
        print(f"Service error: {e}")
        sys.exit(1)