#!/bin/bash
# Railway build script for backend

set -e

echo "📦 Installing root dependencies..."
npm ci

echo "📦 Installing backend dependencies..."
cd apps/api
npm ci

echo "🔨 Building backend..."
npm run build

echo "✅ Backend build complete"
