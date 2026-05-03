#!/bin/bash
set -e

echo "📦 Building Backend Service..."
echo "================================"

# Install dependencies from monorepo root
echo "1️⃣  Installing dependencies..."
npm install

# Build local packages first
echo "2️⃣  Building local packages..."
npm run build:packages

# Build backend
echo "3️⃣  Building backend application..."
npm run build --prefix apps/api

# Generate Prisma client (migrations will run at deploy time)
echo "4️⃣  Generating Prisma client..."
cd apps/api
npx prisma generate
cd ../..

echo "✅ Backend build complete!"

