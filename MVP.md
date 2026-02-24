# MVP Deployment Guide — 100% Free, No Domain Required

**Last Updated**: February 18, 2026
**Goal**: Deploy your MVP to production using only free tiers, no custom domain needed
**Total Cost**: $0/month
**Time to Deploy**: ~30 minutes

---

## What You'll Get

After following this guide, you'll have:

✅ **Live Backend API** at `https://your-app-xyz123.up.railway.app/v1`
✅ **Live Frontend** at `https://your-app.vercel.app`
✅ **Production Database** (PostgreSQL on Supabase)
✅ **Image Hosting** (Cloudinary)
✅ **Auto-deploy on Git push** (CI/CD)
✅ **HTTPS enabled** (automatic SSL)
✅ **Admin Dashboard** accessible immediately

**No credit card required for any service!**

---

## Prerequisites

- [ ] GitHub account (free)
- [ ] Terminal access (macOS/Linux/Windows WSL)
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Your local app working (can run `npm run start:dev`)

---

## Phase 1: Database — Supabase PostgreSQL (FREE)

### Why Supabase? 
- Same PostgreSQL you're using locally (zero code changes)
- Free tier: 500 MB database, unlimited API requests
- Auto-backups included
- No credit card required

<!-- +b_etE/s6d+7HLR -->

### Step 1.1: Create Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (click "Continue with GitHub")
4. Authorize Supabase to access your GitHub

### Step 1.2: Create New Project

1. Click **"New Project"**
2. Fill in the form:
   - **Name**: `influencer-platform` (or any name you want)
   - **Database Password**: Click "Generate a password" and **SAVE IT SOMEWHERE SAFE**
     ```
     Example: xK9mP2nQ5rT8wE3vY7zA ////   +b_etE/s6d+7HLR
     ```
   - **Region**: Choose closest to you:
     - US: `East US (North Virginia)`
     - EU: `West EU (Ireland)`
     - Asia: `Southeast Asia (Singapore)`
   - **Pricing Plan**: Keep on "Free"
3. Click **"Create new project"**
4. Wait 2-3 minutes while Supabase provisions your database

### Step 1.3: Get Database Connection Details

1. Once project is ready, go to **Settings** (gear icon on left sidebar)
2. Click **Database** in settings menu
3. Scroll down to **"Connection string"** section
4. Find the **URI** tab
5. You'll see a connection string like this:
   ```
   postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   postgresql://postgres:+b_etE/s6d+7HLR@db.xgsmjmkmmzubjmwahjik.supabase.co:5432/postgres
   ```

6. **Copy these values** (you'll need them later):
   ```
   DATABASE_HOST=aws-0-us-east-1.pooler.supabase.com
   DATABASE_PORT=5432
   DATABASE_NAME=postgres
   DATABASE_USER=postgres.xxxxxxxxxxxxxxxxxxxx
   DATABASE_PASSWORD=the-password-you-saved-earlier

   DATABASE_HOST=aws-0-us-east-1.pooler.supabase.com
   DATABASE_PORT=5432
   DATABASE_NAME=postgres
   DATABASE_USER=postgres.xxxxxxxxxxxxxxxxxxxx
   DATABASE_PASSWORD=+b_etE/s6d+7HLR

   ```

### Step 1.4: Test Database Connection (Optional)

```bash
# Test connection from your local machine
psql "postgresql://postgres:%2Bb_etE%2Fs6d%2B7HLR@db.xgsmjmkmmzubjmwahjik.supabase.co:5432/postgres?sslmode=require" -c '\conninfo'
pg_isready -d "postgresql://postgres:+b_etE/s6d+7HLR@db.xgsmjmkmmzubjmwahjik.supabase.co:5432/postgres"
psql "postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# If connected successfully, you'll see:
# postgres=>

# Type \q to quit
```

If you don't have `psql` installed, skip this — we'll verify after deployment.

✅ **Database is ready!** Keep the connection details for later.

---

## Phase 2: Image Hosting — Cloudinary (FREE)

### Why Cloudinary?
- Already integrated in your code
- Free tier: 25 GB storage, 25 GB bandwidth/month
- Automatic image optimization
- No credit card required

### Step 2.1: Create Cloudinary Account

1. Go to **https://cloudinary.com/users/register_free**
2. Sign up with email or GitHub
3. Verify your email (check inbox/spam)

### Step 2.2: Get API Credentials

1. After login, you'll land on the **Dashboard**
2. You'll immediately see your credentials at the top:
   ```
   Cloud name: dxyz123abc
   API Key:    123456789012345
   API Secret: Click "Reveal" → abcdefghijklmnopqrstuvwxyz123
   ```

3. **Copy these values**:
   ```
   CLOUDINARY_CLOUD_NAME=dxyz123abc
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
   K-QtoRuXB1Rz7zPeKbj-WvsZ6zw

   CLOUDINARY_CLOUD_NAME=dc9z8hklu
   CLOUDINARY_API_KEY=628527996958519
   CLOUDINARY_API_SECRET=K-QtoRuXB1Rz7zPeKbj-WvsZ6zw
   ```

✅ **Cloudinary is ready!** Keep the credentials for later.

---

## Phase 3: Backend Deployment — Railway (FREE)

### Why Railway?
- Easiest to deploy NestJS apps
- Free tier: $5 credit/month (renews monthly)
- Auto-deploy on Git push
- No credit card required

### Step 3.1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with GitHub (click "Login with GitHub")
4. Authorize Railway to access your repositories

### Step 3.2: Deploy Backend

#### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub first:
   ```bash
   cd /Users/hasnainraza/Desktop/My\ Stores/influencer-platform

   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"

   # Create GitHub repo (via GitHub website) then:
   git remote add origin https://github.com/YOUR-USERNAME/influencer-platform.git
   git push -u origin main
   ```

2. In Railway dashboard:
   - Click **"New Project"**
   - Click **"Deploy from GitHub repo"**
   - Select your `influencer-platform` repository
   - Railway will auto-detect it's a monorepo

3. Configure build settings:
   - Click on the service that was created
   - Go to **Settings** tab
   - Set **Root Directory**: `packages/backend`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm run start:prod`
   - Click **"Save"**

#### Option B: Deploy using Railway CLI (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd packages/backend

# Initialize Railway project
railway init

# Deploy
railway up
```

### Step 3.3: Add Environment Variables

1. In Railway dashboard, click your service
2. Go to **Variables** tab
3. Click **"New Variable"** and add these one by one:

```bash
# Database (from Supabase Step 1.3)
DATABASE_HOST=aws-0-us-east-1.pooler.supabase.com
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres.xxxxxxxxxxxxxxxxxxxx
DATABASE_PASSWORD=your-supabase-password-here
DATABASE_SSL=true

# JWT Secrets (generate new ones!)
JWT_SECRET=PASTE_SECRET_HERE
REFRESH_TOKEN_SECRET=PASTE_SECRET_HERE
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# Cloudinary (from Step 2.2)
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-secret-here

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

**Generate JWT Secrets**:
```bash
# Run these two commands to generate secure secrets
openssl rand -base64 64
openssl rand -base64 64
```

**For CORS_ORIGIN**: We'll update this after deploying frontend (Step 4)

4. Click **"Deploy"** (or it auto-deploys on variable save)

### Step 3.4: Get Backend URL

1. In Railway dashboard, click your service
2. Go to **Settings** tab
3. Scroll to **Networking** section
4. Click **"Generate Domain"**
5. Railway will give you a URL like:
   ```
   https://influencer-platform-production-abc123.up.railway.app
   ```

6. **Your backend API is now at**:
   ```
   https://influencer-platform-production-abc123.up.railway.app/v1
   ```

### Step 3.5: Run Database Migrations

#### Method 1: Using Railway CLI
```bash
cd packages/backend

# Connect to Railway project
railway link

# Run migrations
railway run npm run migration:run

# Seed admin user
railway run npm run seed:admin
```

#### Method 2: Add migration to start command
1. In Railway → Settings → Start Command, change to:
   ```bash
   npm run migration:run && npm run seed:admin && npm run start:prod
   ```
2. Save — Railway will redeploy and run migrations automatically

### Step 3.6: Verify Backend is Running

```bash
# Test health endpoint (replace with your URL)
curl https://influencer-platform-production-abc123.up.railway.app/v1/health

# Should return:
# {"status":"ok"}
```

✅ **Backend is live!** Save your backend URL for frontend setup.

---

## Phase 4: Frontend Deployment — Vercel (FREE)

### Why Vercel?
- Made for Next.js (your frontend framework)
- Free tier: Unlimited deployments, 100 GB bandwidth
- Global CDN included
- Auto-deploy on Git push
- No credit card required

### Step 4.1: Create Vercel Account

1. Go to **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

### Step 4.2: Deploy Frontend

1. In Vercel dashboard:
   - Click **"Add New..."** → **"Project"**
   - Select your `influencer-platform` repository
   - Vercel will detect Next.js app

2. Configure deployment:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `packages/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (leave default)

3. Add Environment Variable:
   - Click **"Environment Variables"**
   - Add this variable:
     ```
     Key:   NEXT_PUBLIC_API_URL
     Value: https://influencer-platform-production-abc123.up.railway.app/v1
     ```
     *(Use YOUR backend URL from Step 3.4)*

4. Click **"Deploy"**

### Step 4.3: Wait for Deployment

Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to global CDN

This takes ~2-3 minutes.

### Step 4.4: Get Frontend URL

Once deployed, Vercel gives you URLs:
```
Production: https://influencer-platform.vercel.app
Preview:    https://influencer-platform-git-main.vercel.app
```

✅ **Frontend is live!**

---

## Phase 5: Connect Backend ↔ Frontend

### Step 5.1: Update Backend CORS

Now that you have your frontend URL, update backend CORS:

1. Go back to **Railway dashboard**
2. Click your backend service
3. Go to **Variables** tab
4. Find `CORS_ORIGIN` variable
5. Update it to your Vercel URL:
   ```
   CORS_ORIGIN=https://influencer-platform.vercel.app
   ```
6. Save (Railway will auto-redeploy)

### Step 5.2: Verify Everything Works

1. Open your frontend: `https://influencer-platform.vercel.app`

2. Test login with admin:
   - Email: `admin@platform.com`
   - Password: `Admin@123456!`

3. You should see the admin dashboard!

✅ **Your MVP is fully deployed and working!**

---

## Phase 6: Enable Auto-Deploy (CI/CD)

### For Backend (Railway)

**Already enabled!** Every push to `main` branch auto-deploys.

To verify:
1. Railway dashboard → Your service → Deployments tab
2. You'll see "Deploy on push" is enabled

### For Frontend (Vercel)

**Already enabled!** Every push to `main` branch auto-deploys.

To verify:
1. Vercel dashboard → Your project → Settings → Git
2. "Production Branch" should be set to `main`

**How to deploy changes**:
```bash
# Make changes to your code
# Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# Both Railway and Vercel will auto-deploy!
```

---

## Your MVP URLs

After completing all steps, save these URLs:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://influencer-platform.vercel.app` | Main app |
| **Backend API** | `https://your-app-abc123.up.railway.app/v1` | API endpoints |
| **Database** | `aws-0-us-east-1.pooler.supabase.com` | PostgreSQL |
| **Images** | `https://res.cloudinary.com/your-cloud/...` | CDN |

---

## Test Your MVP

### Test 1: Admin Login
```
URL: https://influencer-platform.vercel.app/auth/login
Email: admin@platform.com
Password: Admin@123456!
```

### Test 2: Create Test Brand
1. Go to `/auth/register`
2. Register as BRAND
3. Create a product with image upload
4. Verify image uploads to Cloudinary

### Test 3: Create Test Influencer
1. Register as INFLUENCER
2. Browse campaigns
3. Generate tracking link

### Test 4: Admin Review
1. Login as admin
2. Go to Product Reviews
3. Approve/reject products

✅ **All features working!**

---

## Free Tier Limits & What Happens When You Exceed

### Supabase (Database)
- **Free**: 500 MB database
- **When exceeded**: Upgrade to Pro ($25/month) or optimize database
- **Monitor**: Supabase Dashboard → Database → Disk usage

### Cloudinary (Images)
- **Free**: 25 GB storage, 25 GB bandwidth/month
- **When exceeded**: Upgrade to pay-as-you-go (~$0.10/GB)
- **Monitor**: Cloudinary Console → Analytics

### Railway (Backend)
- **Free**: $5 credit/month
- **When exceeded**: App sleeps, or upgrade to Hobby ($5/month)
- **Monitor**: Railway Dashboard → Usage

### Vercel (Frontend)
- **Free**: 100 GB bandwidth/month
- **When exceeded**: Upgrade to Pro ($20/month)
- **Monitor**: Vercel Dashboard → Analytics

### Estimated User Capacity (Free Tier)
- **Database**: ~5,000 users
- **Images**: ~50,000 product images
- **Backend**: ~10,000 requests/month
- **Frontend**: ~100,000 page views/month

---

## Troubleshooting

### Issue 1: "Cannot connect to database"

**Check Railway logs**:
```bash
railway logs
```

**Common fixes**:
- Verify `DATABASE_HOST` is correct (check for typos)
- Verify `DATABASE_PASSWORD` matches Supabase password
- Verify `DATABASE_SSL=true` is set
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)

**Test connection manually**:
```bash
railway run npx prisma db pull
# If this works, connection is fine
```

### Issue 2: "CORS error" in browser console

**Check backend CORS setting**:
```bash
railway variables get CORS_ORIGIN
```

**Should match frontend URL exactly**:
```
✅ Correct: https://influencer-platform.vercel.app
❌ Wrong:   http://influencer-platform.vercel.app  (http vs https)
❌ Wrong:   https://influencer-platform.vercel.app/ (trailing slash)
```

**Fix**:
```bash
railway variables set CORS_ORIGIN=https://influencer-platform.vercel.app
```

### Issue 3: Frontend shows "Loading..." forever

**Check browser console** (F12 → Console tab)

**Common causes**:
- API URL is wrong (check `NEXT_PUBLIC_API_URL` in Vercel)
- Backend is down (test backend health endpoint)
- CORS not configured

**Fix**:
1. Verify backend is running: `curl https://your-backend.railway.app/v1/health`
2. Check Vercel environment variable: `NEXT_PUBLIC_API_URL`
3. Redeploy frontend: Vercel dashboard → Deployments → Redeploy

### Issue 4: "Admin not found" when logging in

**Migrations didn't run or seed script failed**

**Fix**:
```bash
# Using Railway CLI
railway link
railway run npm run migration:run
railway run npm run seed:admin

# Or add to Railway start command:
# npm run migration:run && npm run seed:admin && npm run start:prod
```

### Issue 5: Images not uploading

**Check Cloudinary credentials**:
```bash
railway variables get CLOUDINARY_API_KEY
railway variables get CLOUDINARY_API_SECRET
```

**Test upload manually**:
```bash
# Get JWT token from login
TOKEN="your-jwt-token"

# Test upload
curl -X POST https://your-backend.railway.app/v1/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test.jpg"
```

**Common fixes**:
- Verify API Secret is copied correctly (it's long!)
- Check file size < 5 MB
- Check file type is jpg/png/webp/gif

### Issue 6: Backend keeps restarting

**Check Railway logs**:
```bash
railway logs --tail 100
```

**Common causes**:
- Missing environment variable
- Database migration failed
- Out of memory (upgrade Railway plan)
- Syntax error in code

---

## Monitoring Your MVP

### Supabase Dashboard
- **URL**: https://app.supabase.com/project/your-project-id
- **Check**:
  - Database size: Settings → Database → Disk usage
  - Active connections: Database → Connection pooling
  - Logs: Logs Explorer

### Railway Dashboard
- **URL**: https://railway.app/project/your-project-id
- **Check**:
  - Deployments: Deployments tab
  - Logs: Logs tab (real-time)
  - Usage: Usage tab (credit consumption)
  - Metrics: Metrics tab (CPU, memory, network)

### Vercel Dashboard
- **URL**: https://vercel.com/your-username/influencer-platform
- **Check**:
  - Deployments: Deployments tab
  - Analytics: Analytics tab (page views, top pages)
  - Logs: Deployment logs
  - Bandwidth: Settings → Usage

### Cloudinary Console
- **URL**: https://cloudinary.com/console
- **Check**:
  - Storage used: Dashboard
  - Bandwidth: Dashboard → Analytics
  - Transformations: Dashboard → Transformations

---

## Sharing Your MVP

Give these URLs to testers:

```
🌐 App: https://influencer-platform.vercel.app

👤 Test Accounts:
   Admin:      admin@platform.com / Admin@123456!
   Brand:      [Create via /auth/register]
   Influencer: [Create via /auth/register]

📋 Features to Test:
   ✓ Brand: Create products, upload images
   ✓ Influencer: Browse campaigns, generate tracking links
   ✓ Admin: Review products, manage users
```

---

## Next Steps After MVP

Once MVP is validated:

1. **Add Custom Domain** (requires domain purchase)
   - Vercel: yourapp.com
   - Railway: api.yourapp.com

2. **Upgrade Services** (as needed)
   - Supabase Pro: $25/month (8 GB database)
   - Railway Hobby: $5/month (no sleep)
   - Vercel Pro: $20/month (1 TB bandwidth)

3. **Add Monitoring**
   - UptimeRobot (free uptime monitoring)
   - Sentry (free error tracking)
   - LogRocket (user session replay)

4. **Optimize**
   - Enable Vercel Analytics
   - Add Redis caching (Railway add-on)
   - Enable Cloudinary optimizations

5. **Scale**
   - Move to Supabase Pro
   - Enable Railway auto-scaling
   - Add CDN for API (Cloudflare)

---

## Cost Projection

| Users | Monthly Cost |
|-------|--------------|
| 0-1,000 | **$0** (all free tiers) |
| 1,000-5,000 | **$30** (Supabase Pro + Railway Hobby) |
| 5,000-10,000 | **$75** (+ Vercel Pro + Cloudinary pay-as-you-go) |
| 10,000+ | **$150+** (scale all services) |

---

## Backup & Recovery

### Database Backups (Automatic)

Supabase includes automatic backups:
- **Free tier**: 7-day point-in-time recovery
- **Location**: Supabase Dashboard → Database → Backups

**Manual backup**:
```bash
# Export entire database
pg_dump "postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" > backup-$(date +%Y%m%d).sql

# Restore from backup
psql "postgresql://..." < backup-20260218.sql
```

### Image Backups

Cloudinary stores images permanently. To backup:
- Option 1: Download from Cloudinary Console → Assets
- Option 2: Use Cloudinary API to bulk download
- No action needed for MVP

### Code Backups

**Already done!** Your code is in GitHub.

---

## Security Checklist for MVP

- [x] HTTPS enabled (automatic with Railway + Vercel)
- [x] JWT secrets are different from development
- [x] Database not publicly accessible (Supabase handles this)
- [x] CORS configured correctly (only your frontend can call API)
- [x] Admin user password is strong
- [x] Environment variables not committed to Git
- [x] Database password is strong (Supabase-generated)
- [ ] Enable rate limiting (add later: `@nestjs/throttler`)
- [ ] Add 2FA for admin (add later)
- [ ] Set up error tracking (add later: Sentry)

---

## Quick Deploy Summary

```bash
# 1. Create Supabase project → Get DATABASE_* credentials

# 2. Create Cloudinary account → Get CLOUDINARY_* credentials

# 3. Deploy backend to Railway
cd packages/backend
railway init
railway variables set DATABASE_HOST=...
railway variables set DATABASE_PASSWORD=...
railway variables set CLOUDINARY_CLOUD_NAME=...
railway up

# 4. Deploy frontend to Vercel
cd packages/web
vercel --prod
# Add NEXT_PUBLIC_API_URL in Vercel dashboard

# 5. Update CORS in Railway
railway variables set CORS_ORIGIN=https://your-app.vercel.app

# 6. Test!
# Open: https://your-app.vercel.app
# Login: admin@platform.com / Admin@123456!
```

**Total time**: ~30 minutes
**Total cost**: $0/month
**Your MVP is LIVE!** 🚀

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Your Project Docs**: `ENVIRONMENT_SETUP.md`, `CURRENT_PROGRESS.md`

---

**Remember**: This is an MVP setup. All services can scale as your user base grows. Start free, upgrade when needed!
