#!/bin/bash
set -e

echo "🚀 Starting Backend Service..."
echo "================================"

# Navigate to backend directory
cd apps/api

# Run database migrations
echo "1️⃣  Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "2️⃣  Starting application..."
node dist/index.js
