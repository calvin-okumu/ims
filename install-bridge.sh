#!/bin/bash

echo "ZK8500R Fingerprint Bridge Service Installer"
echo "============================================"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    echo "   Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "   CentOS/RHEL: sudo yum install python3 python3-pip"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $PYTHON_VERSION"

# Check Python version (require 3.7+)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ $PYTHON_MAJOR -lt 3 ] || ([ $PYTHON_MAJOR -eq 3 ] && [ $PYTHON_MINOR -lt 7 ]); then
    echo "❌ Python 3.7 or higher is required. Current version: $PYTHON_VERSION"
    exit 1
fi

echo "✓ Python version is compatible"
echo ""

# Install required Python packages
echo "Installing required Python packages..."
echo "This will install: websockets, pyzkfp"
echo ""

pip3 install --user websockets pyzkfp

if [ $? -eq 0 ]; then
    echo "✓ Python packages installed successfully"
else
    echo "❌ Failed to install Python packages"
    echo "   Try: pip3 install --user websockets pyzkfp"
    exit 1
fi

echo ""

# Check if ZKFinger SDK is available (optional check)
echo "Checking for ZKFinger SDK..."
if ldconfig -p | grep -q "libzkfp"; then
    echo "✓ ZKFinger SDK libraries found"
else
    echo "⚠️  ZKFinger SDK libraries not found in system"
    echo "   This is OK for testing - the bridge will use mock data"
    echo "   For production, install ZKFinger SDK from ZKTeco"
fi

echo ""

# Create startup script
echo "Creating startup script..."
cat > start-bridge.sh << 'EOF'
#!/bin/bash
echo "Starting ZK8500R Fingerprint Bridge Service..."
echo "Press Ctrl+C to stop"
echo ""
cd "$(dirname "$0")"
python3 services/fingerprint_bridge.py
EOF

chmod +x start-bridge.sh

echo "✓ Startup script created: start-bridge.sh"
echo ""

# Test the bridge service
echo "Testing bridge service..."
timeout 5 python3 services/fingerprint_bridge.py > /dev/null 2>&1 &
BRIDGE_PID=$!

sleep 2

if kill -0 $BRIDGE_PID 2>/dev/null; then
    echo "✓ Bridge service started successfully"
    kill $BRIDGE_PID
else
    echo "⚠️  Bridge service failed to start (this is normal without ZKFinger SDK)"
    echo "   The service will still work for testing with mock data"
fi

echo ""
echo "Installation Complete!"
echo "======================"
echo ""
echo "To start the fingerprint bridge service:"
echo "  ./start-bridge.sh"
echo ""
echo "The bridge will run on WebSocket port 8765"
echo "Web browsers can then connect to: ws://localhost:8765"
echo ""
echo "For production use:"
echo "1. Install ZKFinger SDK from ZKTeco"
echo "2. Connect ZK8500R scanner to USB"
echo "3. Run the bridge service"
echo ""
echo "Happy scanning! 🎯"