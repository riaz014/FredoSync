@echo off
REM Fredo Cloud - Local Development Setup Script for Windows

echo 🚀 Setting up Fredo Cloud for local development...

REM Check Node.js
echo 📋 Checking Node.js version...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)
echo ✅ Node.js version:
node -v

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install API dependencies
echo 📦 Installing API dependencies...
cd apps\api
call npm install
cd ..\..

REM Install Web dependencies
echo 📦 Installing Web dependencies...
cd apps\web
call npm install
cd ..\..

REM Setup environment files
echo 🔧 Setting up environment files...

if not exist "apps\api\.env" (
    echo Creating apps\api\.env from example...
    copy apps\api\.env.example apps\api\.env
    echo ⚠️  Please update apps\api\.env with your actual credentials
)

if not exist "apps\web\.env.local" (
    echo Creating apps\web\.env.local from example...
    copy apps\web\.env.local.example apps\web\.env.local
)

REM Setup database
echo 🗄️  Setting up database...
cd packages\database

echo Generating Prisma client...
call npx prisma generate

echo Running database migrations...
call npx prisma migrate dev

echo Seeding database...
call npm run db:seed

cd ..\..

echo.
echo ✨ Setup complete!
echo.
echo 📝 Next steps:
echo    1. Update apps\api\.env with your credentials:
echo       - DATABASE_URL
echo       - JWT secrets
echo       - Cloudinary credentials
echo       - SMTP settings
echo.
echo    2. Start the development servers:
echo       npm run dev
echo.
echo    3. Access the applications:
echo       - Web: http://localhost:3000
echo       - API: http://localhost:4000
echo       - API Docs: http://localhost:4000/api/docs
echo.
echo    4. Demo login credentials:
echo       - Email: demo@fredocloud.com
echo       - Password: Demo123!
echo.
echo Happy coding! 🎉
pause
