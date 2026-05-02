@echo off
echo.
echo ============================================
echo   DATABASE SETUP - QUICK START
echo ============================================
echo.
echo You need a PostgreSQL database to continue.
echo.
echo OPTION 1: Free Cloud Database (RECOMMENDED - 2 minutes)
echo ---------------------------------------------------------
echo.
echo A. Neon.tech (Easiest):
echo    1. Visit: https://neon.tech
echo    2. Sign up with GitHub (free, no credit card)
echo    3. Create a project
echo    4. Copy the connection string
echo.
echo B. Supabase:
echo    1. Visit: https://supabase.com
echo    2. Sign up with GitHub (free)
echo    3. Create a project
echo    4. Go to Settings ^> Database ^> Connection String
echo    5. Copy the connection string
echo.
echo.
echo OPTION 2: Local PostgreSQL
echo ---------------------------------------------------------
echo    1. Download from: https://www.postgresql.org/download/
echo    2. Install and note your password
echo    3. Use: postgresql://postgres:password@localhost:5432/fredocloud
echo.
echo.
set /p "db_url=Paste your DATABASE_URL here: "

if "%db_url%"=="" (
    echo.
    echo ❌ No database URL provided. Exiting...
    pause
    exit /b 1
)

echo.
echo 💾 Updating .env file...

(
echo # Database Configuration - Updated %date% %time%
echo DATABASE_URL=%db_url%
echo.
echo # JWT Secrets ^(Auto-generated - KEEP THESE SECRET!^)
echo JWT_ACCESS_SECRET=pfl+7tXTT3iH47wmasvM9QAAVXdqNm7OHVohPUvoQ7I=
echo JWT_REFRESH_SECRET=TdIxWtfImvhkYRKM70lWPpZB/AH03LJouycFnMHLedI=
echo.
echo # Cloudinary Configuration ^(Optional - for avatar uploads^)
echo CLOUDINARY_CLOUD_NAME=demo-cloud
echo CLOUDINARY_API_KEY=123456789
echo CLOUDINARY_API_SECRET=demo-secret
echo.
echo # Email Configuration ^(Optional - for email notifications^)
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=demo@example.com
echo SMTP_PASS=demo-password
echo.
echo # Application URLs
echo CLIENT_URL=http://localhost:3000
echo PORT=4000
echo NODE_ENV=development
) > apps\api\.env

echo ✅ Database URL saved to apps\api\.env
echo.
echo 🔄 Running Prisma migrations...
cd packages\database
call npx prisma generate
call npx prisma migrate deploy
call npx prisma db push
call npm run db:seed
cd ..\..

echo.
echo ✨ Database setup complete!
echo.
echo 🚀 Starting development servers...
echo.
start cmd /k "cd /d "%CD%" && npm run dev"

echo.
echo ✅ All done! Check the new terminal window.
echo.
echo 📱 Access your app at:
echo    - Web: http://localhost:3000
echo    - API: http://localhost:4000
echo    - Docs: http://localhost:4000/api/docs
echo.
echo 🔑 Demo login:
echo    Email: demo@fredocloud.com
echo    Password: Demo123!
echo.
pause
