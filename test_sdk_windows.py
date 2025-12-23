"""
Windows ZKFinger SDK Test Script

This script tests if the ZKFinger SDK is properly installed and can detect devices.
Run this before starting the bridge service to verify your setup.

Usage:
    python test_sdk_windows.py
"""

import sys
import platform

print("🔍 Windows ZKFinger SDK Test")
print("=" * 35)
print(f"Platform: {platform.system()}")
print(f"Python: {sys.version.split()[0]}")
print()

# Test available ZKTeco libraries
PYZK_AVAILABLE = False
PYZKFP_AVAILABLE = False

try:
    from zk import ZK
    print("✅ pyzk library imported successfully")
    PYZK_AVAILABLE = True
except ImportError:
    print("⚠ pyzk library not found")

try:
    import pyzkfp
    print("✅ pyzkfp library imported successfully")
    print(f"   Available attributes: {dir(pyzkfp)}")
    PYZKFP_AVAILABLE = True
except ImportError as e:
    print(f"⚠ pyzkfp library not found: {e}")
    PYZKFP_AVAILABLE = False

if not PYZK_AVAILABLE and not PYZKFP_AVAILABLE:
    print("❌ No ZKTeco SDK libraries found")
    print("   Install with: pip install pyzk")
    print("   Or:           pip install pyzkfp")
    print("   And install ZKFinger SDK from ZKTeco")

if PYZK_AVAILABLE:
    try:
        print("\n🔧 Testing pyzk library...")

        # Try to create ZK instance (for network-attached devices)
        zk = ZK('127.0.0.1', port=4370, timeout=5)
        print("✅ pyzk ZK instance created")

        try:
            # Try to connect (may fail if no device on network)
            conn = zk.connect()
            print("✅ Connected to ZKTeco device!")
            print("🎯 Device is ready for operations")

            # Test device communication
            conn.test_voice()
            print("✅ Device communication test successful")

            # Clean up
            conn.disconnect()
            print("✅ Connection closed")

        except Exception as e:
            print(f"⚠ Could not connect to device: {e}")
            print("   - Device may not be network-attached")
            print("   - Check IP address and port")
            print("   - Ensure device is on same network")

    except Exception as e:
        print(f"❌ pyzk test error: {e}")

if PYZKFP_AVAILABLE:
    try:
        print("\n🔧 Testing pyzkfp library...")

        # Initialize scanner
        scanner = pyzkfp.ZKFP()

        init_result = scanner.init()
        if init_result == 0:
            print("✅ ZKFinger SDK initialized successfully")

            # Get device count
            device_count = scanner.get_device_count()
            print(f"📱 Found {device_count} fingerprint device(s)")

            if device_count > 0:
                print("\n🔌 Testing device connection...")

                # Try to open first device
                open_result = scanner.open_device(0)
                if open_result == 0:
                    print("✅ Fingerprint device opened successfully")
                    print("🎯 Device is ready for fingerprint capture!")

                    # Close device
                    scanner.close_device()
                    print("✅ Device closed")

                else:
                    print(f"❌ Failed to open device (error code: {open_result})")
                    print("   - Check USB connection")
                    print("   - Verify device drivers")
                    print("   - Ensure device has power")

            else:
                print("❌ No fingerprint devices detected")
                print("   - Check USB connection")
                print("   - Try different USB port")
                print("   - Verify device is powered on")

            # Clean up
            scanner.terminate()
            print("✅ SDK terminated")

        else:
            print(f"❌ SDK initialization failed (error code: {init_result})")
            print("   - Verify ZKFinger SDK is installed")
            print("   - Check SDK installation path")
            print("   - Ensure proper permissions")

    except Exception as e:
        print(f"❌ pyzkfp test error: {e}")
        print("   - Check SDK installation")
        print("   - Verify device compatibility")

else:
    print("❌ Cannot test SDK - pyzkfp not available")

print("\n📋 Next Steps:")
if PYZKFP_AVAILABLE:
    print("1. Start the bridge service: python services/fingerprint_bridge_windows.py")
    print("2. Open browser to: http://localhost:3000")
    print("3. Check scanner status indicator")
else:
    print("1. Install pyzkfp: pip install pyzkfp")
    print("2. Install ZKFinger SDK from ZKTeco")
    print("3. Run this test again")

print("\n💡 Tips:")
print("- Ensure scanner is connected and powered on")
print("- Try different USB ports if device not detected")
print("- Check Windows Device Manager for driver issues")
print("- Run as Administrator if permission issues occur")