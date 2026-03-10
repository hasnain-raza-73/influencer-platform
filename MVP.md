# MVP Deployment Guide — 100% Free, No Domain Required

**Last Updated**: February 18, 2026
**Goal**: Deploy your MVP to production using only free tiers, no custom domain needed
**Total Cost**: $0/month
**Time to Deploy**: ~30 minutes

---

## What You'll Get

After following this guide, you'll have:

✅ **Live Backend API** at `https://influencer-platform-backend.onrender.com/v1`
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

## Phase 2.5: OAuth Integration Setup (OPTIONAL for MVP)

### Social Media Integration for Influencers

Your platform supports OAuth integration with Instagram, Facebook, and TikTok, allowing influencers to:
- ✅ Connect and verify their social media accounts
- ✅ Automatically sync follower counts and engagement metrics
- ✅ Display verified badges to brands
- ✅ Build trust through authenticated social profiles

### Quick Setup Guide

**Option 1: Skip for initial MVP** (Recommended for first deployment)
- OAuth requires creating developer apps on each platform
- Can take 2-5 business days for app review/approval
- You can deploy your MVP first and add OAuth later

**Option 2: Set up OAuth now**
- Follow the comprehensive guide: **`OAUTH_SETUP.md`**
- Complete setup for:
  - Instagram Basic Display API
  - Facebook Login
  - TikTok Login Kit
- Add OAuth credentials to environment variables (shown in Step 3.4)

### OAuth Environment Variables

If setting up OAuth, you'll need these additional credentials:

```bash
# Instagram OAuth
INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/instagram/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/facebook/callback

# TikTok OAuth
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/tiktok/callback
```

**Detailed Setup Instructions**: See **`OAUTH_SETUP.md`** for step-by-step guide.

**Note**: OAuth credentials are marked as optional in the environment variables. The app will work without them, but influencers won't be able to connect their social accounts until OAuth is configured.

---

## Phase 3: Backend Deployment — Render.com (100% FREE) or Railway ($5/month)

### ⚠️ Railway Pricing Update (2025)
Railway **no longer has a free tier**. You get a 29-day trial OR $5 credit, then must add payment method (~$5-10/month for small apps).

### Recommended: Use Render.com Instead (TRUE FREE TIER)
- **100% free forever** (no credit card required)
- 750 hours/month free (= 24/7 uptime for 1 service)
- Auto-deploy on Git push
- Easy Node.js deployment

### Alternative: Railway (~$5/month after trial)
If you prefer Railway's easier interface, see PRODUCTION.md for Railway setup. This guide uses **Render** for completely free deployment.

### Step 3.1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"** (top right)
3. Click **"Sign up with GitHub"**
4. Authorize Render to access your repositories

### Step 3.2: Push Code to GitHub (Required)

Render deploys from GitHub, so push your code first:

```bash
cd /Users/hasnainraza/Desktop/My\ Stores/influencer-platform

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Create GitHub repo at https://github.com/new
# Name it: influencer-platform
# Then add remote and push:
git remote add origin https://github.com/YOUR-USERNAME/influencer-platform.git
git branch -M main
git push -u origin main
```

### Step 3.3: Deploy Backend to Render

1. In Render dashboard, click **"New +"** → **"Web Service"**

2. Connect your GitHub repository:
   - Click **"Connect a repository"**
   - Select **`influencer-platform`**
   - Click **"Connect"**

3. Configure the service:
   ```
   Name:              influencer-platform-backend
   Region:            Choose closest to you (Oregon/Frankfurt/Singapore)
   Branch:            main
   Root Directory:    packages/backend
   Runtime:           Node
   Build Command:     npm install && npm run build
   Start Command:     npm run start:prod
   Instance Type:     Free
   ```

4. Click **"Advanced"** and add environment variables (see next step)

5. Click **"Create Web Service"** (don't deploy yet - add env vars first)

### Step 3.4: Add Environment Variables

Before deployment completes, add all environment variables:

1. In Render, while still on the service creation page, scroll to **"Environment Variables"**
2. Click **"Add Environment Variable"** for each of these:

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

# OAuth - Social Media Integration (Optional for MVP - see OAUTH_SETUP.md)
INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/instagram/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/facebook/callback

TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/tiktok/callback

FRONTEND_URL=https://your-app.vercel.app

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

3. After adding all variables, scroll up and click **"Create Web Service"**

Render will now:
- Clone your repository
- Install dependencies
- Build your NestJS app
- Deploy it

This takes ~3-5 minutes. ☕

### Step 3.5: Get Backend URL

Once deployment completes:

1. Render automatically gives you a URL at the top of the page:
   ```
   https://influencer-platform-backend.onrender.com
   ```

2. **Your backend API is now at**:
   ```
   https://influencer-platform-backend.onrender.com/v1
   ```

**Save this URL** - you'll need it for frontend setup!

### Step 3.6: Run Database Migrations

Render doesn't have a CLI for running commands, so we'll add migrations to the start command:

1. In Render dashboard → Your service → **Settings**
2. Find **"Start Command"**
3. Click **"Edit"** and change to:
   ```bash
   npm run migration:run && npm run seed:admin && npm run start:prod
   ```
4. Click **"Save Changes"**
5. Render will redeploy (takes ~2 minutes)

This will:
- Run all database migrations
- Create the admin user
- Start the API server

### Step 3.7: Verify Backend is Running

```bash
# Test health endpoint (replace with YOUR URL)
curl https://influencer-platform-backend.onrender.com/v1/health

# Should return:
# {"status":"ok","timestamp":"2026-02-24T..."}
```

✅ **Backend is live!** Save your backend URL for frontend setup.

**Note**: Render free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up. This is normal for the free tier!

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
     Value: https://influencer-platform-backend.onrender.com/v1
     ```
     *(Use YOUR backend URL from Step 3.5)*

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

1. Go back to **Render dashboard**
2. Click your backend service
3. Go to **Environment** (left sidebar)
4. Find `CORS_ORIGIN` variable
5. Click **"Edit"** and update it to your Vercel URL:
   ```
   CORS_ORIGIN=https://influencer-platform.vercel.app
   ```
6. Click **"Save Changes"** (Render will auto-redeploy in ~2 min)

### Step 5.2: Verify Everything Works

1. Open your frontend: `https://influencer-platform.vercel.app`

2. Test login with admin:
   - Email: `admin@platform.com`
   - Password: `Admin@123456!`

3. You should see the admin dashboard!

✅ **Your MVP is fully deployed and working!**

---

## Phase 6: Enable Auto-Deploy (CI/CD)

### For Backend (Render)

**Already enabled!** Every push to `main` branch auto-deploys.

To verify:
1. Render dashboard → Your service → **Events** tab
2. You'll see automatic deployments on every git push

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

# Both Render and Vercel will auto-deploy!
# Render: ~3-5 minutes
# Vercel: ~2-3 minutes
```

---

## Your MVP URLs

After completing all steps, save these URLs:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://influencer-platform.vercel.app` | Main app |
| **Backend API** | `https://influencer-platform-backend.onrender.com/v1` | API endpoints |
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

### Render (Backend)
- **Free**: 750 hours/month (enough for 24/7 uptime for 1 service)
- **Limitation**: App sleeps after 15 min inactivity (wakes on first request ~30sec)
- **When exceeded**: Upgrade to Starter ($7/month for always-on)
- **Monitor**: Render Dashboard → Usage

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

**Check Render logs**:
1. Go to Render dashboard → Your backend service
2. Click **"Logs"** tab (live tail)
3. Look for database connection errors

**Common fixes**:
- Verify `DATABASE_HOST` is correct (check for typos in Render Environment variables)
- Verify `DATABASE_PASSWORD` matches Supabase password
- Verify `DATABASE_SSL=true` is set
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)

**Test connection**:
1. Check Render logs for PostgreSQL connection errors
2. Verify all DATABASE_* variables are set correctly in Render → Environment

### Issue 2: "CORS error" in browser console

**Check backend CORS setting**:
1. Go to Render dashboard → Your backend service
2. Click **"Environment"** (left sidebar)
3. Find `CORS_ORIGIN` variable

**Should match frontend URL exactly**:
```
✅ Correct: https://influencer-platform.vercel.app
❌ Wrong:   http://influencer-platform.vercel.app  (http vs https)
❌ Wrong:   https://influencer-platform.vercel.app/ (trailing slash)
```

**Fix**:
1. In Render → Environment, edit `CORS_ORIGIN`
2. Set to: `https://influencer-platform.vercel.app`
3. Save Changes (triggers redeploy)

### Issue 3: Frontend shows "Loading..." forever

**Check browser console** (F12 → Console tab)

**Common causes**:
- API URL is wrong (check `NEXT_PUBLIC_API_URL` in Vercel)
- Backend is sleeping (Render free tier sleeps after 15 min - first request takes ~30sec)
- CORS not configured

**Fix**:
1. Verify backend is running: `curl https://influencer-platform-backend.onrender.com/v1/health`
2. If slow response, wait 30 seconds for Render to wake up
3. Check Vercel environment variable: `NEXT_PUBLIC_API_URL`
4. Redeploy frontend: Vercel dashboard → Deployments → Redeploy

### Issue 4: "Admin not found" when logging in

**Migrations didn't run or seed script failed**

**Fix**:
1. Check Render logs to see if migrations ran successfully
2. Make sure Start Command includes migrations:
   ```bash
   npm run migration:run && npm run seed:admin && npm run start:prod
   ```
3. Go to Render → Settings → Start Command → Edit
4. Save and redeploy

### Issue 5: Images not uploading

**Check Cloudinary credentials in Render**:
1. Go to Render → Environment
2. Verify these variables exist:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

**Test upload manually**:
```bash
# Get JWT token from login
TOKEN="your-jwt-token"

# Test upload
curl -X POST https://influencer-platform-backend.onrender.com/v1/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test.jpg"
```

**Common fixes**:
- Verify API Secret is copied correctly (it's long!)
- Check file size < 5 MB
- Check file type is jpg/png/webp/gif

### Issue 6: Backend keeps restarting

**Check Render logs**:
1. Render dashboard → Your service → **Logs** tab
2. Look for error messages in the build or runtime logs

**Common causes**:
- Missing environment variable (check Render → Environment)
- Database migration failed (check logs for SQL errors)
- Out of memory (unlikely on free tier, but check logs)
- Syntax error in code (check build logs)

---

## Monitoring Your MVP

### Supabase Dashboard
- **URL**: https://app.supabase.com/project/your-project-id
- **Check**:
  - Database size: Settings → Database → Disk usage
  - Active connections: Database → Connection pooling
  - Logs: Logs Explorer

### Render Dashboard
- **URL**: https://dashboard.render.com/web/your-service-id
- **Check**:
  - Deployments: **Events** tab (deployment history)
  - Logs: **Logs** tab (real-time tail)
  - Usage: **Metrics** tab (requests, response times)
  - Health: Check if service shows "Live" status

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
   - Render: api.yourapp.com

2. **Upgrade Services** (as needed)
   - Supabase Pro: $25/month (8 GB database)
   - Render Starter: $7/month (always-on, no sleep)
   - Vercel Pro: $20/month (1 TB bandwidth)

3. **Add Monitoring**
   - UptimeRobot (free uptime monitoring)
   - Sentry (free error tracking)
   - LogRocket (user session replay)

4. **Optimize**
   - Enable Vercel Analytics
   - Add Redis caching (separate service or Upstash)
   - Enable Cloudinary optimizations

5. **Scale**
   - Move to Supabase Pro
   - Upgrade Render to Starter plan
   - Add CDN for API (Cloudflare)

---

## Cost Projection

| Users | Monthly Cost |
|-------|--------------|
| 0-1,000 | **$0** (all free tiers) |
| 1,000-5,000 | **$32** (Supabase Pro $25 + Render Starter $7) |
| 5,000-10,000 | **$72** (+ Vercel Pro $20 + Cloudinary pay-as-you-go) |
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

- [x] HTTPS enabled (automatic with Render + Vercel)
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

# 3. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/influencer-platform.git
git push -u origin main

# 4. Deploy backend to Render
# - Go to render.com → New Web Service
# - Connect GitHub repo
# - Set root directory: packages/backend
# - Add all environment variables
# - Deploy

# 4. Deploy frontend to Vercel
cd packages/web
vercel --prod
# Add NEXT_PUBLIC_API_URL in Vercel dashboard

# 5. Update CORS in Render
# - Render dashboard → Environment
# - Edit CORS_ORIGIN = https://your-app.vercel.app
# - Save Changes

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
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Your Project Docs**: `ENVIRONMENT_SETUP.md`, `CURRENT_PROGRESS.md`

---

**Remember**: This is an MVP setup. All services can scale as your user base grows. Start free, upgrade when needed!
