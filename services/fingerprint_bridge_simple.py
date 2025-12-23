#!/usr/bin/env python3
"""
Simple Test Fingerprint Bridge Service

This is a minimal version for testing the API integration without external dependencies.
"""

import json
import sys
import time
from typing import Dict, Any

print("Simple Fingerprint Bridge Service")
print("=" * 40)
print("This is a test version without external dependencies")
print("Use for testing API integration only")
print()

class SimpleBridge:
    def __init__(self):
        self.running = True
        print("Bridge initialized (mock mode)")

    def capture_fingerprint(self, finger_index: int = 0) -> Dict[str, Any]:
        """Mock fingerprint capture"""
        print(f"Capturing fingerprint for finger {finger_index}...")

        # Simulate capture delay
        time.sleep(1)

        # Mock successful capture
        mock_template = "U0tFRVBURU1QTEFURQ=="  # Base64 encoded mock template
        quality_score = 85 + (finger_index * 2)  # Vary quality by finger

        return {
            "status": "success",
            "template": mock_template,
            "quality": min(100, quality_score),
            "fingerIndex": finger_index,
            "version": "10.0",
            "bioType": 1,
            "source": "mock",
            "message": f"Mock fingerprint captured for finger {finger_index}"
        }

def main():
    """Simple test mode"""
    print("Starting in test mode...")
    print("This service demonstrates API integration")
    print("Press Ctrl+C to exit")
    print()

    bridge = SimpleBridge()

    try:
        while bridge.running:
            # In a real implementation, this would handle WebSocket connections
            # For now, just keep the service running
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nService stopped by user")
        bridge.running = False

if __name__ == "__main__":
    main()