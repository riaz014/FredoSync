# FredoSync - Vercel + Render Deployment Guide

Deploy your FredoSync application with **Vercel** (Frontend) and **Render** (Backend + Database).

## 🚀 Quick Start

### Prerequisites
- GitHub account with FredoSync repository pushed
- Vercel account (sign up free at https://vercel.com)
- Render account (sign up free at https://render.com)
- Cloudinary account (for file uploads) - https://cloudinary.com
- Gmail account with App Password (for emails)

---

## Part 1: Deploy Backend to Render (15 minutes)

### Step 1: Create Render Account & Connect GitHub

1. Go to https://render.com/register
2. Click "Sign up with GitHub"
3. Authorize Render to access your GitHub repositories

### Step 2: Deploy Backend with Blueprint (Automatic Setup)

1. Go to https://dashboard.render.com/blueprints
2. Click "New Blueprint Instance"
3. Connect your GitHub repository: `riaz014/FredoSync`
4. Render will detect the `render.yaml` file
5. Give it a Blueprint name: `FredoSync`
6. Click "Apply"

This will automatically create:
- ✅ PostgreSQL Database (`fredosync-db`)
- ✅ Web Service (`fredosync-api`)
- ✅ DATABASE_URL environment variable (auto-linked)

### Step 3: Configure Backend Environment Variables

After deployment starts, go to your `fredosync-api` service:

1. Click on **"fredosync-api"** service
2. Go to **"Environment"** tab
3. Add/Update these variables:

```bash
# Required - Generate secure secrets
JWT_ACCESS_SECRET=<generate-with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 32>

# Required - Cloudinary (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Required - Email (Gmail with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Required - Frontend URL (add after deploying frontend)
CLIENT_URL=https://your-app.vercel.app

# Auto-configured
NODE_ENV=production
PORT=4000
DATABASE_URL=<auto-injected-by-render>
```

4. Click **"Save Changes"**
5. Service will automatically redeploy

### Step 4: Get Backend URL

After deployment completes (5-10 minutes):
1. Go to your service dashboard
2. Copy the URL at the top (e.g., `https://fredosync-api.onrender.com`)
3. **Save this URL** - you'll need it for frontend deployment

---

## Part 2: Deploy Frontend to Vercel (5 minutes)

### Step 1: Create Vercel Account & Connect GitHub

1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click "Add New" → "Project"
2. Find and import `riaz014/FredoSync`
3. Vercel will detect it's a Next.js monorepo

### Step 3: Configure Build Settings

**Framework Preset**: Next.js

**Root Directory**: `apps/web` (click "Edit" and select)

**Build Command**:
```bash
cd ../.. && npm install && npm run build:packages && cd apps/web && npm run build
```

**Output Directory**: Leave default (`.next`)

**Install Command**:
```bash
npm install
```

### Step 4: Configure Environment Variables

Click "Environment Variables" and add:

```bash
NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://your-render-backend-url.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Replace**:
- `your-render-backend-url` with your actual Render backend URL from Step 1
- `your-app.vercel.app` will be shown after first deployment

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Once deployed, copy your Vercel URL (e.g., `https://fredo-sync.vercel.app`)

### Step 6: Update Backend CLIENT_URL

1. Go back to Render dashboard
2. Open `fredosync-api` service
3. Go to "Environment" tab
4. Update `CLIENT_URL` with your Vercel URL
5. Save changes (triggers redeploy)

---

## Part 3: Generate Secure Secrets

### On Windows (PowerShell):
```powershell
# Generate JWT Access Secret
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Generate JWT Refresh Secret (run again for different value)
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### On Mac/Linux:
```bash
# Generate JWT Access Secret
openssl rand -base64 32

# Generate JWT Refresh Secret
openssl rand -base64 32
```

---

## Part 4: Set Up Cloudinary

1. Go to https://cloudinary.com/users/register/free
2. Sign up for free account
3. After login, go to Dashboard
4. Copy these values:
   - **Cloud Name**: Your cloud name
   - **API Key**: Your API key
   - **API Secret**: Your API secret (click "Reveal")

---

## Part 5: Set Up Gmail for Emails

### Enable Gmail App Password:

1. Go to https://myaccount.google.com/security
2. Enable **"2-Step Verification"** (if not already enabled)
3. Go to https://myaccount.google.com/apppasswords
4. Generate an App Password for "Mail"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Use this as `SMTP_PASS` (remove spaces: `abcdefghijklmnop`)

---

## Part 6: Seed Database (Optional)

To add demo data to your database:

1. Go to Render Dashboard → `fredosync-api` service
2. Click "Shell" tab
3. Run these commands:

```bash
cd packages/database
npx prisma db seed
```

---

## ✅ Deployment Checklist

### Backend (Render)
- [ ] Render account created
- [ ] Blueprint deployed (database + API)
- [ ] JWT secrets generated and added
- [ ] Cloudinary credentials added
- [ ] Gmail credentials added
- [ ] CLIENT_URL updated with Vercel URL
- [ ] Deployment successful (green checkmark)
- [ ] Backend URL accessible: `https://your-api.onrender.com/api/health`

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `apps/web`
- [ ] Build command configured
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Frontend URL accessible: `https://your-app.vercel.app`
- [ ] Can login and use the app

---

## 🧪 Testing Your Deployment

### 1. Test Backend
Visit: `https://your-api.onrender.com/api/health`

Should return:
```json
{"status": "ok", "timestamp": "..."}
```

### 2. Test Frontend
1. Visit: `https://your-app.vercel.app`
2. Should see login page
3. Register a new account
4. Login and test features

### 3. Test Real-time Features
1. Open app in two browser tabs
2. Create an announcement in one tab
3. Should appear instantly in other tab

---

## 🔄 Auto-Deploy on Git Push

Both Vercel and Render automatically deploy when you push to GitHub:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

- **Vercel**: Deploys frontend automatically (~2 min)
- **Render**: Deploys backend automatically (~5 min)

---

## 🆓 Free Tier Limits

### Render Free Tier:
- ✅ PostgreSQL database (expires after 90 days)
- ✅ Web service spins down after 15 min inactivity
- ✅ 750 hours/month free
- ⚠️ First request after inactivity may take 30-60 seconds

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Always-on (no cold starts)
- ✅ Automatic SSL certificates

---

## 📊 Your Deployment URLs

After completing deployment, update this section:

```
Frontend: https://your-app.vercel.app
Backend:  https://your-api.onrender.com
Database: PostgreSQL on Render (managed)
```

Share the **Frontend URL** with others to let them access your app!

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check Render logs: Service → Logs tab
- Verify DATABASE_URL is set
- Ensure all environment variables are added
- Check Prisma migrations ran successfully

### Frontend Build Fails
- Check build command includes root npm install
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check Vercel build logs for errors

### "CORS Error" in Browser
- Verify CLIENT_URL in backend matches frontend URL exactly
- Ensure no trailing slash in URLs
- Check backend is running and accessible

### Database Connection Error
- Wait for database to fully provision (5-10 min)
- Check DATABASE_URL is connected in Render
- Verify migrations ran: Check service logs

### Cold Starts (Render Free Tier)
- First request takes 30-60 seconds if service was idle
- This is normal for free tier
- Consider upgrading to paid tier for always-on

---

## 🚀 Next Steps

1. **Custom Domain** (Optional):
   - Vercel: Settings → Domains → Add custom domain
   - Render: Settings → Custom Domain

2. **Monitoring**:
   - Vercel Analytics: Built-in, free
   - Render Metrics: Check service dashboard

3. **Logs**:
   - Vercel: Deployments → View logs
   - Render: Service → Logs tab

---

## 💡 Pro Tips

1. **Environment Variables**: Always update CLIENT_URL on backend after deploying frontend
2. **Seed Data**: Use demo data for testing: `npx prisma db seed`
3. **Logs**: Check logs first when debugging issues
4. **Cold Starts**: First request after 15 min may be slow (Render free tier)
5. **GitHub Integration**: Both platforms auto-deploy on push to main branch

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

Happy Deploying! 🎉
