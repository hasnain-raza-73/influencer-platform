# OAuth Integration Setup Guide

**Last Updated**: March 5, 2026
**Purpose**: Complete guide to set up social media OAuth integrations for Instagram, Facebook, and TikTok

---

## Overview

Your influencer platform uses OAuth 2.0 to connect influencer social media accounts. This guide walks you through creating developer apps on each platform and obtaining the necessary credentials.

**What you'll get**:
- ✅ Instagram Business/Creator account integration
- ✅ Facebook Page integration
- ✅ TikTok Creator account integration
- ✅ Automatic follower metrics sync
- ✅ Verified social accounts for influencers

---

## Prerequisites

Before starting, ensure you have:
- [ ] A Facebook account (required for both Instagram and Facebook OAuth)
- [ ] A TikTok account
- [ ] Admin access to a Facebook Page (for Facebook OAuth)
- [ ] An Instagram Business or Creator account (for Instagram OAuth)
- [ ] Your backend deployed and accessible (e.g., `https://your-backend.onrender.com`)
- [ ] Your frontend deployed and accessible (e.g., `https://your-app.vercel.app`)

---

## Part 1: Instagram OAuth Setup

### Why Instagram Business API?
Instagram OAuth requires using the Facebook/Meta platform because Instagram API is part of the Facebook Graph API ecosystem.

### Step 1.1: Create a Facebook App

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Click **"My Apps"** in top right
   - Click **"Create App"**

2. **Choose App Type**
   - Select: **"Business"** (or "Consumer" if Business is not available)
   - Click **"Next"**

3. **Configure Basic Info**
   ```
   App Name:        Influencer Platform Social Connect
   App Contact Email: your-email@example.com
   Business Account: (Select existing or skip for now)
   ```
   - Click **"Create App"**

4. **Complete Security Check** (if prompted)

### Step 1.2: Add Instagram Basic Display Product

1. In your app dashboard, find **"Add Products"** section
2. Find **"Instagram Basic Display"**
3. Click **"Set Up"**

### Step 1.3: Configure Instagram Basic Display

1. On the Instagram Basic Display page, scroll to **"Basic Display"**
2. Click **"Create New App"**
3. Fill in the form:
   ```
   Display Name:        Influencer Platform
   Valid OAuth Redirect URIs:
     - http://localhost:3000/v1/oauth/instagram/callback
     - https://your-backend.onrender.com/v1/oauth/instagram/callback
   Deauthorize Callback URL:
     - https://your-backend.onrender.com/v1/oauth/instagram/deauthorize
   Data Deletion Request URL:
     - https://your-backend.onrender.com/v1/oauth/instagram/data-deletion
   ```
   - Click **"Save Changes"**

### Step 1.4: Get Instagram Credentials

1. Scroll to **"Instagram App ID"** and **"Instagram App Secret"**
2. Click **"Show"** next to App Secret
3. **Copy these values**:
   ```
   INSTAGRAM_CLIENT_ID=1234567890123456
   INSTAGRAM_CLIENT_SECRET=abc123def456ghi789jkl012mno345pq
   ```

4. **Important**: Add test users (for testing before going live):
   - Go to **"Roles"** → **"Instagram Testers"**
   - Click **"Add Instagram Testers"**
   - Enter Instagram usernames to test with
   - Those users must accept the invite in their Instagram app

### Step 1.5: Configure App Settings

1. Go to **Settings** → **Basic** in left sidebar
2. Scroll to **"App Domains"**:
   ```
   localhost
   your-app.vercel.app
   your-backend.onrender.com
   ```
3. Add **Privacy Policy URL** (required):
   ```
   https://your-app.vercel.app/privacy-policy
   ```
   *(Create a simple privacy policy page if you don't have one)*

4. Click **"Save Changes"**

### Step 1.6: Update Environment Variables

Add to your backend `.env` or Render environment variables:
```bash
INSTAGRAM_CLIENT_ID=1234567890123456
INSTAGRAM_CLIENT_SECRET=abc123def456ghi789jkl012mno345pq
INSTAGRAM_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/instagram/callback
```

**For local development**, also update `packages/backend/.env`:
```bash
INSTAGRAM_CLIENT_ID=1234567890123456
INSTAGRAM_CLIENT_SECRET=abc123def456ghi789jkl012mno345pq
INSTAGRAM_REDIRECT_URI=http://localhost:3000/v1/oauth/instagram/callback
```

### Step 1.7: Submit for Review (Optional - for public launch)

Instagram Basic Display starts in **Development Mode** (only testers can connect). To allow any user:

1. Go to **App Review** → **Requests**
2. Add **instagram_basic** permission
3. Submit for review (usually takes 2-5 business days)

**For MVP/Testing**: Skip this - use Instagram Testers instead.

---

## Part 2: Facebook OAuth Setup

### Step 2.1: Use the Same Facebook App

Good news! You can use the same Facebook app you created for Instagram.

1. Go to your app dashboard: https://developers.facebook.com/apps/
2. Select your app: "Influencer Platform Social Connect"

### Step 2.2: Add Facebook Login Product

1. In the dashboard, find **"Add Products"**
2. Find **"Facebook Login"**
3. Click **"Set Up"**

### Step 2.3: Configure Facebook Login Settings

1. Click **"Facebook Login"** → **"Settings"** in left sidebar
2. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/v1/oauth/facebook/callback
   https://your-backend.onrender.com/v1/oauth/facebook/callback
   ```
3. Enable these settings:
   - ✅ **Client OAuth Login**: Yes
   - ✅ **Web OAuth Login**: Yes
   - ✅ **Use Strict Mode for Redirect URIs**: Yes
4. Click **"Save Changes"**

### Step 2.4: Get Facebook Credentials

1. Go to **Settings** → **Basic** in left sidebar
2. You'll see:
   ```
   App ID:     123456789012345
   App Secret: Click "Show" → abc123def456ghi789
   ```
3. **Copy these values**:
   ```
   FACEBOOK_APP_ID=123456789012345
   FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345pq
   ```

### Step 2.5: Update Environment Variables

Add to backend environment:
```bash
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345pq
FACEBOOK_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/facebook/callback
```

**For local development**:
```bash
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345pq
FACEBOOK_REDIRECT_URI=http://localhost:3000/v1/oauth/facebook/callback
```

### Step 2.6: Configure Permissions (Optional - for advanced features)

If you want to fetch page insights or post as a page:

1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - `pages_show_list` (view list of pages)
   - `pages_read_engagement` (read page metrics)
   - `instagram_basic` (if connecting Instagram Business accounts)
   - `instagram_manage_insights` (read Instagram metrics)

**For MVP**: The default permissions are sufficient.

---

## Part 3: TikTok OAuth Setup

### Step 3.1: Create TikTok Developer Account

1. **Go to TikTok for Developers**
   - Visit: https://developers.tiktok.com/
   - Click **"Register"** (top right)

2. **Sign up with TikTok account**
   - Use an existing TikTok account
   - Or create a new one

3. **Complete Developer Registration**
   - Fill in personal/company details
   - Agree to TikTok Developer Terms
   - Verify your email

4. **Wait for approval** (usually instant, but can take up to 24 hours)

### Step 3.2: Create a TikTok App

1. After approval, go to **"Manage Apps"**
2. Click **"Connect an app"**

3. **Choose App Type**:
   - Select: **"Web App"**

4. **Fill in App Details**:
   ```
   App Name:           Influencer Platform Social Connect
   Company/Individual: [Your name or company]
   Category:           Social Networking
   Description:        Social media integration platform for influencers

   App Icon:           Upload a 512x512 image (your logo)

   App Website:        https://your-app.vercel.app

   Terms of Service:   https://your-app.vercel.app/terms
   Privacy Policy:     https://your-app.vercel.app/privacy
   ```

5. Click **"Submit"**

### Step 3.3: Configure OAuth Settings

1. After app creation, go to your app dashboard
2. Click **"Manage app"**
3. Go to **"Settings"** tab

4. **Add Redirect URI**:
   - Find **"Login Kit"** section
   - Click **"Apply"** or **"Edit"**
   - Add redirect URIs:
     ```
     http://localhost:3000/v1/oauth/tiktok/callback
     https://your-backend.onrender.com/v1/oauth/tiktok/callback
     ```
   - Click **"Save"**

### Step 3.4: Request API Access

1. Still in app settings, find **"Products"** or **"Add Products"**
2. Enable **"Login Kit"**
3. Request these scopes/permissions:
   - `user.info.basic` (required - user profile info)
   - `video.list` (optional - list user's videos)

4. Click **"Submit for review"**
   - TikTok will review your app (2-5 business days)
   - While pending, you can test with your own account

### Step 3.5: Get TikTok Credentials

1. Go to **"Manage app"** → **"Overview"** or **"Settings"**
2. You'll see:
   ```
   Client Key:    aw123456789abcdefg
   Client Secret: Click "Show" → xyz987654321secretkey
   ```

3. **Copy these values**:
   ```
   TIKTOK_CLIENT_KEY=aw123456789abcdefg
   TIKTOK_CLIENT_SECRET=xyz987654321secretkey
   ```

### Step 3.6: Update Environment Variables

Add to backend environment:
```bash
TIKTOK_CLIENT_KEY=aw123456789abcdefg
TIKTOK_CLIENT_SECRET=xyz987654321secretkey
TIKTOK_REDIRECT_URI=https://your-backend.onrender.com/v1/oauth/tiktok/callback
```

**For local development**:
```bash
TIKTOK_CLIENT_KEY=aw123456789abcdefg
TIKTOK_CLIENT_SECRET=xyz987654321secretkey
TIKTOK_REDIRECT_URI=http://localhost:3000/v1/oauth/tiktok/callback
```

---

## Part 4: Update Production Environment Variables

### For Render.com Backend

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select your backend service**
3. **Click "Environment"** (left sidebar)
4. **Add these new variables**:

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

# Frontend URL (for OAuth redirects)
FRONTEND_URL=https://your-app.vercel.app
```

5. **Click "Save Changes"**
   - Render will automatically redeploy (takes ~2-3 minutes)

### For Railway Backend (if using Railway instead)

1. Go to Railway dashboard
2. Select your backend project
3. Go to **Variables** tab
4. Add the same variables as above
5. Railway will auto-redeploy

---

## Part 5: Testing OAuth Integration

### Test 1: Local Development Testing

1. **Start your local backend**:
   ```bash
   cd packages/backend
   npm run start:dev
   ```

2. **Start your local frontend**:
   ```bash
   cd packages/web
   npm run dev
   ```

3. **Test Instagram OAuth**:
   - Login as an influencer: http://localhost:3001/auth/login
   - Go to: http://localhost:3001/influencer/settings/social-accounts
   - Click **"Connect Instagram"**
   - You should be redirected to Instagram
   - Login and authorize
   - You should be redirected back with success message

4. **Test Facebook OAuth**:
   - Click **"Connect Facebook"**
   - Login and authorize
   - Select Facebook Page to connect
   - Verify success

5. **Test TikTok OAuth**:
   - Click **"Connect TikTok"**
   - Login and authorize
   - Verify success

### Test 2: Production Testing

1. **Deploy your changes** (if not already deployed):
   ```bash
   git add .
   git commit -m "Add OAuth integration"
   git push origin main
   ```

2. **Wait for deployments** (Render + Vercel auto-deploy)

3. **Test on production**:
   - Go to: https://your-app.vercel.app
   - Login as influencer
   - Go to social accounts settings
   - Test all three OAuth flows

### Test 3: Verify Database

```bash
# Connect to production database
psql "your-supabase-connection-string"

# Check connected accounts
SELECT id, platform, platform_username, is_verified, created_at
FROM social_accounts
ORDER BY created_at DESC
LIMIT 5;

# Check metrics
SELECT sa.platform, sm.followers_count, sm.engagement_rate, sm.synced_at
FROM social_accounts sa
LEFT JOIN social_metrics sm ON sm.social_account_id = sa.id
WHERE sm.synced_at = (
  SELECT MAX(synced_at)
  FROM social_metrics
  WHERE social_account_id = sa.id
);
```

---

## Part 6: Troubleshooting

### Issue 1: "Redirect URI mismatch" Error

**Symptom**: After clicking "Connect Instagram/Facebook/TikTok", you get an error about redirect URI.

**Fix**:
1. Check the error message for the actual redirect URI being used
2. Go to the platform's developer console
3. Add that exact URI to allowed redirect URIs
4. Make sure there are no typos or extra slashes
5. URLs must match exactly (http vs https, trailing slash, etc.)

### Issue 2: "App not approved" or "App is in development mode"

**Symptom**: Only specific test accounts can connect.

**Fix**:
- **Instagram**: Add testers via **Roles** → **Instagram Testers**
- **Facebook**: Add testers via **Roles** → **Test Users**
- **TikTok**: App works with your account while pending review
- **For production**: Submit app for review on each platform

### Issue 3: "Invalid client secret" Error

**Symptom**: OAuth fails during token exchange.

**Fix**:
1. Verify the client secret is copied correctly (no extra spaces)
2. Check environment variable names match exactly:
   - `INSTAGRAM_CLIENT_SECRET` (not `INSTAGRAM_APP_SECRET`)
   - `FACEBOOK_APP_SECRET` (not `FACEBOOK_CLIENT_SECRET`)
   - `TIKTOK_CLIENT_SECRET` (not `TIKTOK_APP_SECRET`)
3. Redeploy backend after updating variables

### Issue 4: "Cannot fetch user profile" Error

**Symptom**: OAuth succeeds but user data is not saved.

**Check backend logs**:
```bash
# Render logs
render logs --tail

# Or check in Render dashboard → Logs tab
```

**Common causes**:
- API version mismatch (Instagram/Facebook Graph API version)
- Missing permissions/scopes
- Rate limiting (wait and retry)

### Issue 5: Token Expires Too Quickly

**Instagram/Facebook**:
- Our code automatically exchanges short-lived tokens for long-lived tokens (60 days)
- Tokens should auto-refresh before expiration

**TikTok**:
- TikTok tokens expire in 24 hours
- Implement refresh token flow (already in code)
- Monitor `token_expires_at` in database

---

## Part 7: Security Best Practices

### Protect Your Secrets

✅ **Never commit secrets to Git**:
```bash
# Verify .env is in .gitignore
cat .gitignore | grep .env

# Should see:
# .env
# .env.local
# .env*.local
```

✅ **Use different credentials for development and production**:
- Create separate apps for dev/prod on each platform
- Use different client secrets

✅ **Rotate secrets periodically**:
- Regenerate secrets every 6-12 months
- Update in production environment immediately

### Monitor OAuth Usage

1. **Check platform dashboards**:
   - Instagram/Facebook: https://developers.facebook.com/tools/debug/accesstoken/
   - TikTok: App dashboard analytics

2. **Set up alerts**:
   - Monitor failed OAuth attempts in backend logs
   - Alert on unusual spikes in connections

3. **Review connected accounts**:
   ```sql
   -- Count connected accounts per platform
   SELECT platform, COUNT(*) as count
   FROM social_accounts
   GROUP BY platform;

   -- Check for stale tokens
   SELECT COUNT(*) as expired_tokens
   FROM social_accounts
   WHERE token_expires_at < NOW();
   ```

---

## Part 8: Going Live Checklist

Before launching to real users:

- [ ] **Instagram**:
  - [ ] App reviewed and approved by Meta
  - [ ] Privacy policy page live
  - [ ] Terms of service page live
  - [ ] Production redirect URIs configured
  - [ ] Test with multiple Instagram accounts

- [ ] **Facebook**:
  - [ ] App mode switched to "Live"
  - [ ] Required permissions approved
  - [ ] Page permissions working
  - [ ] Test with multiple Facebook Pages

- [ ] **TikTok**:
  - [ ] App approved by TikTok
  - [ ] All required scopes granted
  - [ ] Production redirect URIs configured
  - [ ] Test with multiple TikTok accounts

- [ ] **Backend**:
  - [ ] All OAuth env vars set in production
  - [ ] FRONTEND_URL points to production frontend
  - [ ] CORS configured correctly
  - [ ] Database migrations run successfully

- [ ] **Frontend**:
  - [ ] Social accounts page loads correctly
  - [ ] OAuth buttons redirect properly
  - [ ] Success/error messages display
  - [ ] Connected accounts show metrics

- [ ] **Monitoring**:
  - [ ] Error tracking enabled (Sentry/LogRocket)
  - [ ] Backend logs being monitored
  - [ ] Database backups enabled

---

## Summary of Environment Variables

After completing this guide, you should have these variables set:

### Backend .env (Production)
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

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app
```

### Backend .env (Local Development)
```bash
# Instagram OAuth
INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/v1/oauth/instagram/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/v1/oauth/facebook/callback

# TikTok OAuth
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=http://localhost:3000/v1/oauth/tiktok/callback

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

---

## Additional Resources

- **Instagram Basic Display API**: https://developers.facebook.com/docs/instagram-basic-display-api
- **Facebook Login**: https://developers.facebook.com/docs/facebook-login
- **TikTok Login Kit**: https://developers.tiktok.com/doc/login-kit-web
- **OAuth 2.0 Spec**: https://oauth.net/2/

---

## Support & Questions

If you encounter issues not covered in this guide:

1. Check backend logs in Render/Railway dashboard
2. Verify all environment variables are set correctly
3. Test OAuth flow in browser DevTools (Network tab)
4. Check platform status pages:
   - Meta: https://developers.facebook.com/status/
   - TikTok: https://developers.tiktok.com/

---

**Your OAuth integration is now complete!** 🎉

Influencers can now connect their Instagram, Facebook, and TikTok accounts to verify their identity and display their audience metrics to brands.
