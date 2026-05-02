# 🚀 Quick Database Setup Guide

**I've opened Neon.tech signup in your browser!**

## Step-by-Step Instructions (2 minutes):

### 1️⃣ Create Your Free Database

**In the browser window that just opened:**

1. ✅ Click "Sign up with GitHub" (fastest)
   - OR use Google/Email
   - No credit card required!

2. ✅ After login, click "Create a project"
   - Name: `Fredo Cloud` (or anything you like)
   - Region: Choose closest to you
   - Click "Create project"

3. ✅ **COPY YOUR DATABASE URL**
   - You'll see a connection string that looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   - Click the "Copy" button
   - **Keep this tab open!**

### 2️⃣ Save Your Database URL

Run this command in your terminal (paste when prompted):

```bash
cd "e:\Fredo Cloud"
.\start.bat
```

When it asks for "DATABASE_URL", paste the connection string you copied!

---

## Alternative: Use Supabase (Also Free)

If Neon doesn't work, try Supabase:

1. Visit: https://supabase.com/dashboard
2. Sign up with GitHub
3. Create new project
4. Go to: Settings → Database → Connection String → URI
5. Copy the connection string
6. Use it in `start.bat`

---

## Already Have the Database URL?

Run this in your terminal:

```bash
cd "e:\Fredo Cloud"
.\start.bat
```

And paste your DATABASE_URL when prompted!

---

## What Happens Next?

After you provide the database URL, the script will:
- ✅ Save it to your `.env` file
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Seed with demo data
- ✅ Start both servers automatically

Then visit **http://localhost:3000** and login with:
- Email: `demo@fredocloud.com`
- Password: `Demo123!`

🎉 You're all set!
