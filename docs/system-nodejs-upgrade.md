# System Node.js Upgrade Instructions

## Option 2: Upgrade System Node.js (Alternative to NVM)

### Step 1: Add NodeSource Repository
```bash
# Add NodeSource repository for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

### Step 2: Install Node.js 20.x
```bash
# Install Node.js 20.x
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 3: Update Application Scripts
Remove the nvm dependency from startup scripts:

**Edit `start.sh`:**
```bash
#!/bin/bash

echo "=== Banking Access Control System Startup ==="
echo ""

# Verify Node.js version
NODE_VERSION=$(node --version)
REQUIRED_VERSION="v20.9.0"

if [[ "$NODE_VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    MINOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f2)

    if [ $MAJOR -gt 20 ] || ([ $MAJOR -eq 20 ] && [ $MINOR -ge 9 ]); then
        echo "✅ Node.js $NODE_VERSION is compatible with Next.js 16"
    else
        echo "❌ Node.js $NODE_VERSION is not compatible. Required: >= $REQUIRED_VERSION"
        echo "   Please upgrade Node.js to version 20.x"
        exit 1
    fi
else
    echo "❌ Could not parse Node.js version: $NODE_VERSION"
    exit 1
fi

echo ""
echo "🚀 Starting development server..."
echo "   Local:   http://localhost:3000"
echo "   Network: http://$(hostname -I | awk '{print $1}'):3000"
echo ""

# Start the development server
npm run dev
```

### Step 4: Remove .nvmrc File
```bash
# Remove nvm version specification
rm .nvmrc
```

## Comparison: NVM vs System Node.js

| Aspect | NVM | System Node.js |
|--------|-----|----------------|
| **Isolation** | ✅ Per-project versions | ❌ System-wide |
| **Safety** | ✅ No system conflicts | ⚠️ May break system packages |
| **Flexibility** | ✅ Multiple versions | ❌ Single version |
| **Ease of Use** | ⚠️ Requires sourcing | ✅ Always available |
| **System Impact** | ✅ None | ⚠️ May affect other apps |
| **Recommended** | ✅ Development | ⚠️ Production servers |

## Current Recommendation

**I recommend keeping NVM** because:
- ✅ **Safer** - No risk of breaking system packages
- ✅ **Flexible** - Easy version switching
- ✅ **Isolated** - Project-specific Node.js versions
- ✅ **Standard Practice** - Industry standard for Node.js development

The startup scripts already handle NVM correctly, and the `.nvmrc` file ensures the right version is used automatically.

## If You Still Prefer System Upgrade

Run these commands as root/admin:

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js 20.x
apt-get install -y nodejs

# Verify
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Then remove .nvmrc and simplify startup scripts
rm .nvmrc
```

**But I strongly recommend keeping NVM for development safety!** 🛡️