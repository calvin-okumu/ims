#!/bin/bash

echo "=== Banking Access Control System Startup ==="
echo ""

# Check if nvm is available
if [ -f ~/.nvm/nvm.sh ]; then
    echo "✓ NVM found, sourcing..."
    source ~/.nvm/nvm.sh
else
    echo "❌ NVM not found. Please install nvm first:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Use the correct Node.js version
echo "✓ Using Node.js version from .nvmrc..."
nvm use

# Verify Node.js version
NODE_VERSION=$(node --version)
REQUIRED_VERSION="v20.9.0"

if [[ "$NODE_VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Extract major and minor version
    MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    MINOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f2)

    if [ $MAJOR -gt 20 ] || ([ $MAJOR -eq 20 ] && [ $MINOR -ge 9 ]); then
        echo "✅ Node.js $NODE_VERSION is compatible with Next.js 16"
    else
        echo "❌ Node.js $NODE_VERSION is not compatible. Required: >= $REQUIRED_VERSION"
        echo "   Run: nvm install 20 && nvm use 20"
        exit 1
    fi
else
    echo "❌ Could not parse Node.js version: $NODE_VERSION"
    exit 1
fi

echo ""
echo "🚀 Starting development server..."

# Check if port 80 is requested (requires sudo)
if [ "$PORT" = "80" ] || [ "$port" = "80" ]; then
    echo "⚠️  Port 80 requires root privileges!"
    echo "   Use: sudo ./start-port80.sh"
    echo "   Or run: sudo PORT=80 ./start.sh"
    echo ""
    echo "   Access: http://$(hostname -I | awk '{print $1}') (no port needed)"
    echo ""
    exit 1
else
    echo "   Local:   http://localhost:3000"
    echo "   Network: http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
fi

# Start the development server
npm run dev