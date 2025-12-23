#!/bin/bash

# Production deployment script for Banking Access Control System
# This script handles deployment to various platforms

set -e

echo "🚀 Starting production deployment..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    echo "❌ NEXT_PUBLIC_SENTRY_DSN is not set"
    exit 1
fi

if [ -z "$SENTRY_ORG" ]; then
    echo "❌ SENTRY_ORG is not set"
    exit 1
fi

if [ -z "$SENTRY_PROJECT" ]; then
    echo "❌ SENTRY_PROJECT is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Build application
echo "🔨 Building application..."
npm run build

# Check build success
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment preparation complete!"
echo "Ready to deploy to your chosen platform (Vercel, Docker, etc.)"