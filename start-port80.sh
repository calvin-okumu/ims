#!/bin/bash

echo "=== Starting on Port 80 (HTTP Default) ==="
echo "This requires sudo for low port access"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run with sudo for port 80 access"
    echo "   Usage: sudo $0"
    exit 1
fi

# Get the calling user
CALLING_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo ~$CALLING_USER)

echo "✓ Running as root, called by user: $CALLING_USER"
echo "✓ User home: $USER_HOME"

# Source nvm from the calling user's environment
if [ -f "$USER_HOME/.nvm/nvm.sh" ]; then
    echo "✓ Loading NVM..."
    export NVM_DIR="$USER_HOME/.nvm"
    source "$USER_HOME/.nvm/nvm.sh"

    echo "✓ Using Node.js version from .nvmrc..."
    cd "$USER_HOME/Project/React_projects/ims"  # Adjust path as needed
    nvm use

    # Verify Node.js version
    NODE_VERSION=$(node --version)
    echo "✓ Node.js version: $NODE_VERSION"

    echo ""
    echo "🚀 Starting server on port 80..."
    echo "   Access: http://$(hostname -I | awk '{print $1}') (no port needed)"
    echo ""

    # Start the server
    PORT=80 npm run dev:network
else
    echo "❌ NVM not found in user environment: $USER_HOME/.nvm/nvm.sh"
    exit 1
fi