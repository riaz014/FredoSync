# Railway Deployment Configuration

## Backend (API) Service

**Root Directory**: `apps/api`

**Build Command**:
```bash
npm install --prefix ../.. && cd apps/api && npm install && npm run build
```

**Start Command**:
```bash
cd apps/api && npm start
```

**Environment Variables**:
```
DATABASE_URL=(auto-injected by Railway PostgreSQL)
JWT_ACCESS_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-gmail-app-password>
CLIENT_URL=https://your-web-app.up.railway.app
PORT=4000
NODE_ENV=production
```

## Frontend (Web) Service

**Root Directory**: `apps/web`

**Build Command**:
```bash
npm install --prefix ../.. && cd apps/web && npm install && npm run build
```

**Start Command**:
```bash
cd apps/web && npm start
```

**Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://your-api-service.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-api-service.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-web-app.up.railway.app
```

## PostgreSQL Database

Add the Railway PostgreSQL plugin - it will automatically inject the `DATABASE_URL` environment variable.

After adding the database, run migrations:

1. Connect to the API service terminal in Railway
2. Run:
```bash
cd packages/database
npx prisma migrate deploy
npx prisma db seed
```

## Important Notes

1. **Generate Secure JWT Secrets**: Use `openssl rand -base64 32` to generate secure random strings
2. **Cloudinary Setup**: Create a free account at cloudinary.com and get your credentials
3. **Email Setup**: For Gmail, enable 2FA and create an App Password
4. **Domain Configuration**: After deployment, update CORS settings with your actual domain
5. **Database Migrations**: Always run migrations after deploying the API

## Deployment Checklist

- [ ] Create Railway project
- [ ] Add PostgreSQL database plugin
- [ ] Create API service with correct build/start commands
- [ ] Add all API environment variables
- [ ] Create Web service with correct build/start commands
- [ ] Add all Web environment variables
- [ ] Run database migrations
- [ ] Seed database with demo data
- [ ] Test all functionality
- [ ] Update README with live URLs

## Troubleshooting

**Build Fails**:
- Ensure root package.json exists
- Check that workspace paths are correct
- Verify all dependencies are listed

**Database Connection Issues**:
- Verify DATABASE_URL is set correctly
- Check PostgreSQL plugin is active
- Ensure migrations have been run

**CORS Errors**:
- Update CLIENT_URL in API environment
- Verify NEXT_PUBLIC_API_URL in Web environment
- Check that domains match exactly (with https://)

**Socket.io Not Connecting**:
- Ensure NEXT_PUBLIC_SOCKET_URL matches API URL
- Check that Socket.io is using both websocket and polling transports
- Verify JWT token is being passed correctly
