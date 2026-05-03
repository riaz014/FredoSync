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

# Run Prisma migrations
echo "4️⃣  Running database migrations..."
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

echo "✅ Backend build complete!"

