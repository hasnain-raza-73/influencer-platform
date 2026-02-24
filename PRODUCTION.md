# Production Deployment Guide

**Last Updated**: February 18, 2026
**Recommended Stack**: Supabase (PostgreSQL) + Cloudinary (Images) + Railway/Render (Backend) + Vercel (Frontend)

> 💡 **New to deployment?** Start with [`MVP.md`](./MVP.md) for a simpler, faster setup (30 minutes, 100% free, no domain required).
>
> This guide is for setting up production with custom domains and advanced configurations.

---

## Why This Stack?

| Service | Purpose | Why |
|---------|---------|-----|
| **Supabase** | PostgreSQL Database | Same database engine you're using locally, managed hosting, generous free tier |
| **Cloudinary** | Image Storage & CDN | Already integrated, best-in-class transformations, simple API |
| **Railway/Render** | Backend API Hosting | Easy NestJS deployment, auto-scaling, built-in CI/CD |
| **Vercel** | Frontend Hosting | Perfect for Next.js, edge network, zero config |

**Total Cost**: $0/month for first ~1000 users (all free tiers)

---

## Phase 1: Database — Supabase Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `influencer-platform`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for provisioning

### Step 2: Get Database Credentials

1. In Supabase dashboard, go to **Settings** → **Database**
2. Find **Connection String** section
3. Copy the **URI** format (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### Step 3: Update Production Environment Variables

Create `packages/backend/.env.production`:

```bash
# Database - Supabase
DATABASE_HOST=db.xxxxxxxxxxxxx.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your-supabase-password-here
DATABASE_SSL=true

# JWT Secrets (use different secrets than development!)
JWT_SECRET=<generate-new-64-char-secret>
REFRESH_TOKEN_SECRET=<generate-new-64-char-secret>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# Cloudinary (same as development)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourapp.com,https://www.yourapp.com
```

**Generate new JWT secrets for production**:
```bash
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 64  # For REFRESH_TOKEN_SECRET
```

### Step 4: Migrate Database

```bash
# Set production environment
export NODE_ENV=production

# Run migrations
cd packages/backend
npm run migration:run

# Seed admin user
npm run seed:admin
```

**Verify migration**:
1. In Supabase dashboard, go to **Table Editor**
2. You should see all tables: `users`, `brands`, `influencers`, `products`, `campaigns`, `tracking_links`, `clicks`, `conversions`, `payouts`

---

## Phase 2: Images — Cloudinary (Already Set Up!)

You're already using Cloudinary in development. **No changes needed** for production.

**Just verify**:
1. Check your Cloudinary dashboard: https://cloudinary.com/console
2. Confirm usage is within free tier:
   - 25 GB storage
   - 25 GB bandwidth/month
   - 25,000 transformations/month

**Optional - Enable upload restrictions**:
1. In Cloudinary → Settings → Upload
2. Enable:
   - File size limit: 5 MB
   - Allowed formats: jpg, png, webp, gif
   - Auto-tagging for organization

---

## Phase 3: Backend — Deploy to Railway

### Option A: Railway (Recommended - Easiest)

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Deploy Backend
```bash
cd packages/backend

# Initialize Railway project
railway init

# Add environment variables
railway variables set DATABASE_HOST=db.xxxxxxxxxxxxx.supabase.co
railway variables set DATABASE_PORT=5432
railway variables set DATABASE_NAME=postgres
railway variables set DATABASE_USER=postgres
railway variables set DATABASE_PASSWORD=your-supabase-password
railway variables set DATABASE_SSL=true
railway variables set JWT_SECRET=your-production-secret
railway variables set REFRESH_TOKEN_SECRET=your-production-secret
railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
railway variables set CLOUDINARY_API_KEY=your_api_key
railway variables set CLOUDINARY_API_SECRET=your_api_secret
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://yourapp.com

# Deploy
railway up
```

#### Step 3: Get Backend URL
```bash
railway domain
# Returns: your-backend-abc123.up.railway.app
```

**Your backend is now live at**: `https://your-backend-abc123.up.railway.app/v1`

---

### Option B: Render (Alternative)

#### Step 1: Create Render Account
Go to https://render.com and sign up

#### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo (or use manual deploy)
3. Configure:
   - **Name**: `influencer-platform-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd packages/backend && npm install && npm run build`
   - **Start Command**: `cd packages/backend && npm run start:prod`
   - **Instance Type**: Free

#### Step 3: Add Environment Variables
In Render dashboard → Environment, add all variables from `.env.production`

#### Step 4: Deploy
Click **"Create Web Service"** — Render will auto-deploy

**Your backend is now live at**: `https://influencer-platform-backend.onrender.com/v1`

---

## Phase 4: Frontend — Deploy to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### Step 2: Configure Frontend Environment
Create `packages/web/.env.production`:

```bash
# Backend API URL (from Railway or Render)
NEXT_PUBLIC_API_URL=https://your-backend-abc123.up.railway.app/v1
```

### Step 3: Deploy
```bash
cd packages/web
vercel --prod
```

#### During deployment prompts:
- **Set up and deploy?**: Y
- **Which scope?**: Select your account
- **Link to existing project?**: N
- **Project name**: `influencer-platform`
- **Directory**: `./`
- **Override settings?**: N

**Your frontend is now live!**

Vercel will give you URLs like:
- Production: `https://influencer-platform.vercel.app`
- Preview: `https://influencer-platform-git-main.vercel.app`

### Step 4: Add Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain: `yourapp.com`
3. Follow DNS configuration instructions
4. Enable **"Redirect www to root"** if desired

---

## Phase 5: Update CORS Origins

After deploying frontend, update backend CORS:

**Railway**:
```bash
railway variables set CORS_ORIGIN=https://influencer-platform.vercel.app,https://yourapp.com
```

**Render**:
1. Go to dashboard → Environment
2. Update `CORS_ORIGIN` variable
3. Save (triggers auto-redeploy)

---

## Deployment Costs

### Free Tier Limits

| Service | Free Tier | Enough For |
|---------|-----------|------------|
| **Supabase** | 500 MB DB, 1 GB storage, 2 GB bandwidth | ~5,000 users |
| **Cloudinary** | 25 GB storage, 25 GB bandwidth/month | ~50,000 images |
| **Railway** | $5 credit/month, sleep after inactivity | Small traffic |
| **Render** | Free tier, sleep after 15 min inactivity | Testing/staging |
| **Vercel** | 100 GB bandwidth, unlimited deployments | ~100,000 page views |

### When You Outgrow Free Tier

**~1,000 active users**:
- Supabase Pro: $25/month (8 GB database)
- Railway Hobby: $5/month (no sleep)
- Cloudinary: Free tier still sufficient
- Vercel: Free tier still sufficient
- **Total**: ~$30/month

**~10,000 active users**:
- Supabase Pro: $25/month
- Railway Pro: $20/month (2 GB RAM)
- Cloudinary: ~$10/month (pay-as-you-go)
- Vercel Pro: $20/month (1 TB bandwidth)
- **Total**: ~$75/month

---

## Production Checklist

### Security

- [ ] Change all JWT secrets from development defaults
- [ ] Use strong Supabase database password
- [ ] Enable Supabase Row Level Security (RLS) - optional
- [ ] Set `NODE_ENV=production` in all environments
- [ ] Update `CORS_ORIGIN` to production domains only
- [ ] Enable HTTPS only (Railway/Render do this automatically)
- [ ] Never commit `.env.production` to git
- [ ] Use environment variable management in deployment platforms

### Database

- [ ] Run all migrations on production database
- [ ] Seed admin user (`npm run seed:admin`)
- [ ] Enable Supabase automatic backups (Settings → Database → Point-in-time Recovery)
- [ ] Test database connection from deployed backend
- [ ] Verify foreign keys and indexes are created

### Backend

- [ ] Backend health check works: `GET /health`
- [ ] Authentication endpoints work: `/v1/auth/login`
- [ ] Image upload works: `/v1/upload/image`
- [ ] Tracking redirect works: `/v1/track/c/:code`
- [ ] Admin endpoints protected with ADMIN role
- [ ] API returns correct CORS headers

### Frontend

- [ ] Login/register flow works
- [ ] Brand dashboard loads
- [ ] Influencer dashboard loads
- [ ] Admin dashboard loads (test with admin@platform.com)
- [ ] Image uploads work (product creation)
- [ ] API calls use production URL

### Monitoring

- [ ] Check Supabase logs: Dashboard → Logs
- [ ] Check Railway logs: `railway logs`
- [ ] Check Vercel logs: Dashboard → Deployments → Logs
- [ ] Set up Supabase email alerts (optional)

---

## CI/CD — Auto-Deploy from GitHub

### Vercel (Frontend)

**Already set up!** Vercel auto-deploys on every push to `main`.

To configure:
1. Connect GitHub repo in Vercel dashboard
2. Set environment variables
3. Every push to `main` = auto-deploy

### Railway (Backend)

```bash
cd packages/backend

# Connect to GitHub
railway link

# Enable auto-deploy
# Railway → Settings → Enable "Auto Deploy" from main branch
```

Now every push to `main` branch auto-deploys backend.

---

## Database Migrations in Production

### Safe Migration Process

```bash
# 1. Create migration locally
npm run migration:generate -- -n AddNewFeature

# 2. Test locally first
npm run migration:run

# 3. Commit migration file
git add packages/backend/src/database/migrations/*
git commit -m "Add migration for new feature"

# 4. Push to trigger auto-deploy
git push origin main

# 5. Railway/Render will auto-run migrations on deploy
# (Add to package.json "start:prod" script: "npm run migration:run && npm run start:prod")
```

**Update `package.json`** to auto-run migrations:
```json
{
  "scripts": {
    "start:prod": "npm run migration:run && node dist/main",
  }
}
```

### Rollback a Migration

```bash
# Connect to production database
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# Check migration history
SELECT * FROM migrations;

# Rollback last migration
npm run migration:revert
```

---

## Backup & Recovery

### Supabase Automatic Backups

**Already enabled by default!**
- Point-in-time recovery: Last 7 days (free tier)
- Daily backups stored in Supabase infrastructure

### Manual Backup

```bash
# Export production database
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" > backup-$(date +%Y%m%d).sql

# Restore from backup
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" < backup-20260218.sql
```

### Cloudinary Backups

Images are stored permanently in Cloudinary. To back up:
1. Go to Cloudinary Console → Assets
2. Use "Download" button for manual backups
3. Or use Cloudinary API to bulk download

---

## Monitoring & Alerts

### Supabase Monitoring

1. Dashboard → Database → Disk Usage
2. Dashboard → Database → Connections
3. Set up email alerts: Settings → Email Preferences

### Railway Monitoring

```bash
# View logs in real-time
railway logs

# Check deployment status
railway status
```

### Uptime Monitoring (Free Tools)

**Option 1: UptimeRobot** (https://uptimerobot.com)
- Free tier: 50 monitors, 5-min checks
- Monitor: `https://your-backend.railway.app/health`

**Option 2: Better Uptime** (https://betterstack.com/better-uptime)
- Free tier: 10 monitors, 30-sec checks
- Email/Slack/Discord alerts

### Error Tracking (Optional)

**Sentry** (https://sentry.io)
```bash
npm install @sentry/node @sentry/nextjs
```

Add to backend `main.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

Free tier: 5,000 errors/month

---

## Scaling Strategy

### Database (Supabase)

**Free → Pro**: When you hit 500 MB or need more connections
- Pro: $25/month → 8 GB database, 60 simultaneous connections

**Pro → Team**: When you hit 8 GB
- Team: $599/month → 32 GB database, 120 connections

### Backend (Railway)

**Hobby → Pro**: When traffic increases
- Enable "Always On" to prevent sleep
- Scale RAM: 512 MB → 2 GB → 8 GB
- Add Redis for caching (optional)

### Frontend (Vercel)

**Free → Pro**: When you hit 100 GB bandwidth
- Pro: $20/month → 1 TB bandwidth
- Enable Edge Middleware for global speed

---

## Common Production Issues

### Issue 1: "Cannot connect to database"

**Check**:
```bash
# Test connection from local machine
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

**Solutions**:
- Verify DATABASE_HOST in environment variables
- Check DATABASE_SSL=true is set
- Confirm Supabase project is not paused (free tier pauses after 7 days inactivity)

### Issue 2: "CORS error" in browser

**Check**:
```bash
railway variables get CORS_ORIGIN
```

**Should be**:
```
https://influencer-platform.vercel.app,https://yourapp.com
```

**No**:
- ❌ `http://` (must be `https://`)
- ❌ Trailing slash
- ❌ `localhost` URLs

### Issue 3: "502 Bad Gateway"

Backend crashed. Check logs:
```bash
railway logs
```

Common causes:
- Missing environment variable
- Database connection timeout
- Migration failed
- Out of memory

### Issue 4: Images not uploading

**Check Cloudinary credentials**:
```bash
railway variables get CLOUDINARY_API_KEY
railway variables get CLOUDINARY_API_SECRET
```

Test upload:
```bash
curl -X POST https://your-backend.railway.app/v1/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg"
```

---

## Quick Deploy Script

Save as `deploy-production.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Production..."

# Backend
echo "📦 Deploying Backend to Railway..."
cd packages/backend
railway up
echo "✅ Backend deployed!"

# Frontend
echo "🌐 Deploying Frontend to Vercel..."
cd ../web
vercel --prod
echo "✅ Frontend deployed!"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Backend: https://your-backend.railway.app"
echo "Frontend: https://influencer-platform.vercel.app"
echo ""
echo "Don't forget to:"
echo "1. Update CORS_ORIGIN in Railway"
echo "2. Update NEXT_PUBLIC_API_URL in Vercel"
echo "3. Test admin login: admin@platform.com"
```

**Usage**:
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

---

## Production vs Development Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| Database | Docker PostgreSQL (local) | Supabase PostgreSQL (cloud) |
| Backend | localhost:3000 | Railway/Render (auto-scaling) |
| Frontend | localhost:3001 | Vercel (edge network) |
| Images | Cloudinary | Cloudinary (same) |
| SSL/HTTPS | No | Yes (automatic) |
| Backups | Manual | Automatic (Supabase) |
| Monitoring | Console logs | Logs + alerts |
| Cost | $0 | $0-30/month |

---

## Next Steps After Deployment

1. **Add Custom Domain**
   - Buy domain from Namecheap/Google Domains
   - Point to Vercel (frontend)
   - Configure subdomain for API: `api.yourapp.com` → Railway

2. **Set Up Email Notifications**
   - SendGrid/Resend for transactional emails
   - Product review notifications
   - Payout confirmations

3. **Enable Analytics**
   - Vercel Analytics (built-in)
   - Google Analytics
   - Custom tracking events

4. **Performance Optimization**
   - Enable Vercel Edge Functions
   - Add Redis caching (Railway add-on)
   - Optimize images with Cloudinary transformations

5. **Security Hardening**
   - Add rate limiting (`@nestjs/throttler`)
   - Enable Supabase RLS
   - Set up WAF (Cloudflare)

---

**Need Help?**

- Supabase Docs: https://supabase.com/docs
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- This project's docs: `CURRENT_PROGRESS.md`, `ENVIRONMENT_SETUP.md`
