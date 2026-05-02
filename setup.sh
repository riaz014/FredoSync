#!/bin/bash

# Fredo Cloud - Local Development Setup Script

echo "🚀 Setting up Fredo Cloud for local development..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install API dependencies
echo "📦 Installing API dependencies..."
cd apps/api
npm install
cd ../..

# Install Web dependencies
echo "📦 Installing Web dependencies..."
cd apps/web
npm install
cd ../..

# Setup environment files
echo "🔧 Setting up environment files..."

# API .env
if [ ! -f "apps/api/.env" ]; then
    echo "Creating apps/api/.env from example..."
    cp apps/api/.env.example apps/api/.env
    echo "⚠️  Please update apps/api/.env with your actual credentials"
fi

# Web .env.local
if [ ! -f "apps/web/.env.local" ]; then
    echo "Creating apps/web/.env.local from example..."
    cp apps/web/.env.local.example apps/web/.env.local
fi

# Setup database
echo "🗄️  Setting up database..."
cd packages/database

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Please set it in apps/api/.env"
    echo "   Example: postgresql://user:password@localhost:5432/fredocloud"
else
    echo "Generating Prisma client..."
    npx prisma generate
    
    echo "Running database migrations..."
    npx prisma migrate dev
    
    echo "Seeding database..."
    npm run db:seed
fi

cd ../..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update apps/api/.env with your credentials:"
echo "      - DATABASE_URL"
echo "      - JWT secrets"
echo "      - Cloudinary credentials"
echo "      - SMTP settings"
echo ""
echo "   2. Start the development servers:"
echo "      npm run dev"
echo ""
echo "   3. Access the applications:"
echo "      - Web: http://localhost:3000"
echo "      - API: http://localhost:4000"
echo "      - API Docs: http://localhost:4000/api/docs"
echo ""
echo "   4. Demo login credentials:"
echo "      - Email: demo@fredocloud.com"
echo "      - Password: Demo123!"
echo ""
echo "Happy coding! 🎉"
