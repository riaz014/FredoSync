# Quick Start Guide - Fredo Cloud

This guide will help you get Fredo Cloud running locally in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running (or use a cloud provider like Supabase)
- Git installed

## Step 1: Clone and Install (2 minutes)

**Windows:**
```bash
cd "e:\Fredo Cloud"
.\setup.bat
```

**Mac/Linux:**
```bash
cd /path/to/fredo-cloud
chmod +x setup.sh
./setup.sh
```

This script will:
- Install all dependencies
- Generate Prisma client
- Create environment files
- Set up the database

## Step 2: Configure Environment (3 minutes)

### Required: Database
Edit `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fredocloud
```

**Quick Database Options:**
1. **Local PostgreSQL**: Install from postgresql.org
2. **Docker**: `docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres`
3. **Supabase**: Free cloud PostgreSQL at supabase.com
4. **Neon**: Free serverless PostgreSQL at neon.tech

### Required: JWT Secrets
Generate secure random strings:

**Windows PowerShell:**
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Add to `apps/api/.env`:
```env
JWT_ACCESS_SECRET=<generated-string-1>
JWT_REFRESH_SECRET=<generated-string-2>
```

### Optional: Cloudinary (for avatar uploads)
1. Create free account at cloudinary.com
2. Get credentials from dashboard
3. Add to `apps/api/.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Without Cloudinary:** Avatar upload will use default avatars

### Optional: Email (for invitations and mentions)
**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password: myaccount.google.com/apppasswords
3. Add to `apps/api/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Without Email:** Invitations will generate links but not send emails

## Step 3: Run Database Setup (2 minutes)

```bash
cd packages/database
npx prisma migrate dev
npm run db:seed
cd ../..
```

This creates the database schema and adds demo data.

## Step 4: Start Development Servers (1 minute)

```bash
npm run dev
```

This starts both API and Web servers.

## Step 5: Access the Application (30 seconds)

Open your browser:

- **Web App**: http://localhost:3000
- **API Server**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs

**Demo Login:**
- Email: `demo@fredocloud.com`
- Password: `Demo123!`

## That's It! 🎉

You're now running Fredo Cloud locally.

## Quick Actions

### Create a New Workspace
1. Click your workspace dropdown in the header
2. Select "Create Workspace" (you'll need to add this button)
3. Fill in name, description, and color

### Invite Team Members
1. Go to Members page
2. Click "Invite Member"
3. Enter email and select role
4. Share the invitation link (or they'll receive an email)

### Create a Goal
1. Go to Goals page
2. Click "New Goal"
3. Fill in details
4. Add milestones
5. Link action items

### Post an Announcement
1. Go to Announcements page
2. Click "New Announcement" (Admin only)
3. Write your message
4. Optionally pin it

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000 (API)
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (Web)
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
1. Check PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Ensure database exists
4. Try: `npx prisma db push`

### Build Errors
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### Prisma Client Errors
```bash
cd packages/database
npx prisma generate
npx prisma migrate deploy
```

## Development Tips

### Access Prisma Studio (Database GUI)
```bash
cd packages/database
npx prisma studio
```
Opens at http://localhost:5555

### Watch Logs
The `npm run dev` command shows logs from both servers. Look for:
- `🚀 Server running on http://localhost:4000` (API)
- `✓ Ready on http://localhost:3000` (Web)

### Hot Reload
Both servers support hot reload:
- Backend: Changes to `.ts` files reload automatically
- Frontend: Changes to React files reload in browser

### Test API Endpoints
Use the Swagger UI at http://localhost:4000/api/docs or:
```bash
# Example: Get current user
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps

1. **Explore the Features**: Try creating goals, action items, and announcements
2. **Read the Documentation**: Check PROJECT_SUMMARY.md for details
3. **Customize**: Modify the code to add your own features
4. **Deploy**: Follow DEPLOYMENT.md to deploy to Railway

## Need Help?

- Check the README.md for full documentation
- Review API docs at /api/docs
- Read PROJECT_SUMMARY.md for technical details
- Email: hiring@fredocloud.com

Happy coding! 🚀
