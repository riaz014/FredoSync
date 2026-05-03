#!/bin/bash
set -e

echo "📦 Building Frontend Service..."
echo "================================"

# Install dependencies from monorepo root
echo "1️⃣  Installing dependencies..."
npm install

# Build local packages first
echo "2️⃣  Building local packages..."
npm run build:packages

# Build frontend
echo "3️⃣  Building frontend application..."
npm run build --prefix apps/web

echo "✅ Frontend build complete!"
