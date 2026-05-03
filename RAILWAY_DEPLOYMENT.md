# Railway Deployment Guide for FredoSync

Complete step-by-step guide to deploy FredoSync on Railway.

## 🚀 Prerequisites

- GitHub account with FredoSync repository
- Railway account (free tier available at railway.app)
- 5-10 minutes to complete

## 📋 Pre-Generated Secure Keys

**JWT Access Secret:**
```
R/L2gVz258IfVM/Oe8XA9NSRT58IPZe2q5B9o7Bkhtc=
```

**JWT Refresh Secret:**
```
iTOaYDX1qgw3r6mVruB75GryiBer5fJoxVb47/+Sl3U=
```

Keep these safe! You'll need them during Railway setup.

---

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click **"Start a Project"** or **"Sign Up"**
3. **Click "Continue with GitHub"** (recommended)
4. Authorize Railway to access your GitHub account
5. Choose organization (or skip to use personal account)

---

## Step 2: Create New Railway Project

1. After signing up, click **"New Project"**
2. Select **"Deploy from GitHub repo"** → Choose **FredoSync**
3. Project name: `FredoCloud`
4. Click **"Create Project"**

---

## Step 3: Add PostgreSQL Database

1. In the project dashboard, click **"+ Add Service"**
2. Search for **"PostgreSQL"** and select it
3. Click **"Deploy"**
4. Wait 30-60 seconds for database to initialize
5. **Important**: Railway auto-generates `DATABASE_URL` variable (do NOT manually set)

**Verify it's created**: You should see a PostgreSQL service card in your project

---

## Step 4: Deploy Backend Service

### 4.1 Add Backend Service

1. Click **"+ Add Service"** → **"GitHub Repo"**
2. Select **FredoSync** repository
3. Click **"Create Service"**

### 4.2 Configure Backend

1. Click the **Backend** service card
2. Go to the **"Settings"** tab
3. Set these configurations:

**Root Directory** (under Build):
```
apps/api
```

**Build Command** (under Build):
```
npm install --prefix ../.. && npm run build
```

**Start Command** (under Runtime):
```
npm start
```

### 4.3 Add Backend Environment Variables

1. Go to the **"Variables"** tab in Backend service
2. Click **"+ Add Variable"** for each:

| Variable | Value | Notes |
|----------|-------|-------|
| `JWT_ACCESS_SECRET` | `R/L2gVz258IfVM/Oe8XA9NSRT58IPZe2q5B9o7Bkhtc=` | From pre-generated keys |
| `JWT_REFRESH_SECRET` | `iTOaYDX1qgw3r6mVruB75GryiBer5fJoxVb47/+Sl3U=` | From pre-generated keys |
| `NODE_ENV` | `production` | Required |
| `PORT` | `4000` | Required |
| `CLIENT_URL` | `https://fredocloud-web.up.railway.app` | **UPDATE THIS after frontend deploys** |
| `CLOUDINARY_CLOUD_NAME` | (optional) | Leave blank if not using Cloudinary |
| `CLOUDINARY_API_KEY` | (optional) | Leave blank if not using Cloudinary |
| `CLOUDINARY_API_SECRET` | (optional) | Leave blank if not using Cloudinary |
| `SMTP_HOST` | `smtp.gmail.com` | For email invitations |
| `SMTP_PORT` | `587` | Gmail SMTP port |
| `SMTP_USER` | `your-email@gmail.com` | Your Gmail address |
| `SMTP_PASS` | `your-app-password` | Gmail App Password (see note below) |

**Gmail App Password Instructions:**
- Go to https://myaccount.google.com/apppasswords
- Select "Mail" and "Windows Computer"
- Generate and copy the 16-character password
- Paste it in SMTP_PASS

**Note**: `DATABASE_URL` is auto-injected by Railway PostgreSQL plugin

### 4.4 Deploy Backend

1. Click the **three-dot menu** → **"Redeploy"**
2. Wait for deployment (2-3 minutes)
3. Once complete, you'll see a **green "Success"** badge
4. Copy the **Backend URL** (format: `https://xxxx.up.railway.app`)

**Save your Backend URL** - you'll need it for frontend

---

## Step 5: Deploy Frontend Service

### 5.1 Add Frontend Service

1. Click **"+ Add Service"** → **"GitHub Repo"**
2. Select **FredoSync** repository
3. Click **"Create Service"**

### 5.2 Configure Frontend

1. Click the **Frontend** service card
2. Go to **"Settings"** tab
3. Set these configurations:

**Root Directory**:
```
apps/web
```

**Build Command**:
```
npm install --prefix ../.. && npm run build
```

**Start Command**:
```
npm start
```

### 5.3 Add Frontend Environment Variables

1. Go to **"Variables"** tab
2. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-api-url.up.railway.app` | `https://fredocloud-api.up.railway.app` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-api-url.up.railway.app` | `https://fredocloud-api.up.railway.app` |

**Replace `your-api-url`** with your Backend URL from Step 4.4

### 5.4 Deploy Frontend

1. Click **three-dot menu** → **"Redeploy"**
2. Wait for deployment (3-5 minutes)
3. Once complete, copy the **Frontend URL**

---

## Step 6: Update Backend CLIENT_URL

Now that frontend is deployed, update the backend:

1. Go to **Backend** service → **"Variables"**
2. Find `CLIENT_URL` variable
3. Update it to your **Frontend URL**
4. Click **three-dot menu** → **"Redeploy"**
5. Wait for redeployment

---

## ✅ Verification

After all deployments complete:

### Test Frontend
1. Visit your **Frontend URL**
2. Login with demo account:
   - **Email**: `demo@fredocloud.com`
   - **Password**: `Demo123!`
3. Create a workspace
4. Check if features work

### Test Backend
1. Visit: `https://your-backend-url.up.railway.app/api/docs`
2. You should see Swagger UI with all API endpoints documented
3. Try a test endpoint like `GET /api/auth/me`

### Check Database
1. Go to **PostgreSQL** service in Railway
2. Click **"Data"** tab
3. Verify tables exist (users, workspaces, goals, etc.)

---

## 📊 Live URLs Summary

After successful deployment, you'll have:

```
Frontend: https://fredocloud-web.up.railway.app
Backend: https://fredocloud-api.up.railway.app
API Docs: https://fredocloud-api.up.railway.app/api/docs
```

---

## 🔧 Troubleshooting

### Build Failures

**Error: npm not found**
- Make sure Node.js is installed
- Check build command syntax
- Verify apps/api and apps/web have package.json files

**Error: DATABASE_URL not set**
- Ensure PostgreSQL service is added BEFORE backend
- Restart backend service

### Deployment Stuck

1. Go to service → **"Logs"** tab
2. Look for error messages
3. Click **three-dot menu** → **"Redeploy"** to retry

### App Won't Start

1. Check **Backend Logs** for connection errors
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is present (auto-injected)

### Frontend Shows API Errors

1. Verify `NEXT_PUBLIC_API_URL` matches Backend URL exactly
2. Redeploy Frontend after updating
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 📝 Environment Variables Checklist

**Backend should have:**
- ✅ DATABASE_URL (auto)
- ✅ JWT_ACCESS_SECRET
- ✅ JWT_REFRESH_SECRET
- ✅ NODE_ENV=production
- ✅ PORT=4000
- ✅ CLIENT_URL (updated after frontend)
- ✅ SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- ✅ CLOUDINARY vars (optional)

**Frontend should have:**
- ✅ NEXT_PUBLIC_API_URL
- ✅ NEXT_PUBLIC_SOCKET_URL

---

## 🎉 Success!

Your FredoSync application is now live! Share these URLs:

- **Website**: Your Frontend URL
- **API Docs**: Your Backend URL + `/api/docs`
- **Demo Account**: demo@fredocloud.com / Demo123!

For production, you may want to:
1. Set up custom domain names via Railway
2. Enable SSL certificates (auto via Railway)
3. Set up automated backups for PostgreSQL
4. Monitor application performance in Railway dashboard
