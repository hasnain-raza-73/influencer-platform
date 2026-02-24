# Environment Variables Setup Guide

**Last Updated**: February 18, 2026

This guide explains all environment variables required for the platform, how to generate credentials, and where to configure them.

---

## Overview

The platform requires environment variables for:
1. **Database connection** (PostgreSQL)
2. **JWT authentication** (access + refresh tokens)
3. **Image uploads** (Cloudinary)
4. **Server configuration** (ports, CORS)

---

## Backend Environment Variables

**File location**: `packages/backend/.env`

### 1. Database Configuration

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=influencer_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
```

**How to configure**:
- If using Docker (recommended for development):
  ```bash
  docker run -d --name influencer-platform-db \
    -e POSTGRES_DB=influencer_platform \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    postgres:15-alpine
  ```
- These values match the Docker container configuration above
- **For production**: Use a managed PostgreSQL service (AWS RDS, Railway, Supabase, etc.) and update these values

**Testing connection**:
```bash
docker exec -it influencer-platform-db psql -U postgres -d influencer_platform
# Should connect successfully
\q  # to quit
```

---

### 2. JWT Secrets

```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

**How to generate**:

**Option 1 — Random string (recommended)**:
```bash
# On macOS/Linux
openssl rand -base64 64

# Example output:
# K8vN2mP9sR3tX6yB4cF7gJ1hL5nQ8wE0aD9fH2kM4pS7vY1zC6eI3oU5rT8xA0bG
```

**Option 2 — Node.js crypto**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Option 3 — Online generator**:
- Visit: https://generate-secret.vercel.app/64
- Copy the generated string

**Security notes**:
- Use **different secrets** for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Minimum 32 characters recommended
- **Never commit secrets to git** — add `.env` to `.gitignore`
- **Change defaults in production** — the example values above are insecure

**Token expiry**:
- `JWT_EXPIRES_IN`: Access token lifetime (default: 15 minutes)
  - Short lifetime = more secure, but users need to refresh more often
  - Options: `15m`, `30m`, `1h`
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token lifetime (default: 7 days)
  - Longer lifetime = better UX (users stay logged in)
  - Options: `7d`, `30d`, `90d`

---

### 3. Cloudinary Configuration (Image Uploads)

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

**How to get credentials**:

#### Step 1: Create Cloudinary Account
1. Go to: https://cloudinary.com/users/register_free
2. Sign up with email or Google
3. Verify your email

#### Step 2: Get Credentials from Dashboard
1. Log in to: https://cloudinary.com/console
2. You'll see the dashboard with:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Reveal" to show, e.g., `abcdefghijklmnopqrstuvwxyz123`)

#### Step 3: Copy to `.env`
```bash
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

**Cloudinary Free Tier**:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month
- Enough for development + small production apps

**Folder structure**:
The app automatically uploads images to:
- `products/` — product images
- `brands/` — brand logos
- `influencers/` — influencer avatars

**Testing upload**:
```bash
# After starting backend, test upload endpoint
curl -X POST http://localhost:3000/v1/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Should return: { "success": true, "data": { "url": "https://res.cloudinary.com/..." } }
```

---

### 4. Server Configuration

```bash
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

**Explanation**:
- `PORT`: Backend server port (default: 3000)
- `NODE_ENV`: `development` | `production` | `test`
  - Affects logging, error messages, CORS
- `CORS_ORIGIN`: Frontend URL for CORS (comma-separated for multiple origins)
  - Development: `http://localhost:3001`
  - Production: `https://yourapp.com,https://www.yourapp.com`

---

## Frontend Environment Variables

**File location**: `packages/web/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

**Explanation**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL
  - Development: `http://localhost:3000/v1`
  - Production: `https://api.yourapp.com/v1`
- The `NEXT_PUBLIC_` prefix makes it available in browser (Next.js convention)

**Used in**: `packages/web/lib/api-client.ts`
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'
```

---

## Complete `.env` Template

### Backend — `packages/backend/.env`

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=influencer_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT Authentication
JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING
REFRESH_TOKEN_SECRET=CHANGE_THIS_TO_A_DIFFERENT_RANDOM_64_CHAR_STRING
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary Image Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### Frontend — `packages/web/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

---

## Environment-Specific Configuration

### Development (Local)
Use the template above with:
- `DATABASE_HOST=localhost` (Docker container)
- `CORS_ORIGIN=http://localhost:3001`
- `NEXT_PUBLIC_API_URL=http://localhost:3000/v1`

### Production

**Backend** (`packages/backend/.env.production`):
```bash
DATABASE_HOST=your-db-host.aws.com
DATABASE_PORT=5432
DATABASE_NAME=influencer_platform_prod
DATABASE_USER=prod_user
DATABASE_PASSWORD=STRONG_RANDOM_PASSWORD

JWT_SECRET=PRODUCTION_SECRET_64_CHARS_MIN
REFRESH_TOKEN_SECRET=DIFFERENT_PRODUCTION_SECRET_64_CHARS_MIN
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourapp.com,https://www.yourapp.com
```

**Frontend** (set in deployment platform like Vercel):
```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com/v1
```

---

## Security Checklist

Before deploying to production:

- [ ] Change all JWT secrets from defaults
- [ ] Use strong database password (not `postgres`)
- [ ] Enable SSL for database connection
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to your production domain
- [ ] Never commit `.env` files to git
- [ ] Use environment variable management (Railway, Vercel, AWS Secrets Manager)
- [ ] Rotate Cloudinary API keys if exposed
- [ ] Enable Cloudinary upload restrictions (file types, max size)
- [ ] Set up database backups
- [ ] Use HTTPS for all production URLs

---

## Troubleshooting

### "Cannot connect to database"
- Check Docker container is running: `docker ps`
- Verify credentials match: `DATABASE_USER`, `DATABASE_PASSWORD`
- Test connection: `docker exec -it influencer-platform-db psql -U postgres -d influencer_platform`

### "Cloudinary upload failed"
- Check credentials are correct (no typos)
- Verify API Secret is revealed and copied correctly
- Test in Cloudinary console: Upload > Upload Widget > Test upload
- Check file size < 5 MB
- Check file type is supported (jpeg, png, webp, gif)

### "CORS error" on frontend
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL exactly
- Include protocol (`http://` or `https://`)
- For multiple origins, use comma-separated: `http://localhost:3001,http://localhost:3000`

### "JWT malformed" or "Invalid token"
- JWT secrets must match between token creation and validation
- Tokens generated with one secret cannot be validated with a different secret
- If you change `JWT_SECRET`, all existing tokens become invalid (users must re-login)

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running: `curl http://localhost:3000/v1/health`
- Check ports: backend on 3000, frontend on 3001
- Look in browser console for the actual API URL being called

---

## Quick Setup Script

Create this file as `setup-env.sh` in project root:

```bash
#!/bin/bash

echo "🔧 Setting up environment files..."

# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 64)
REFRESH_SECRET=$(openssl rand -base64 64)

# Create backend .env
cat > packages/backend/.env << EOF
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=influencer_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT Authentication
JWT_SECRET=$JWT_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_SECRET
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary (REPLACE WITH YOUR VALUES)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
EOF

# Create frontend .env.local
cat > packages/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
EOF

echo "✅ Environment files created!"
echo ""
echo "⚠️  IMPORTANT: Update Cloudinary credentials in packages/backend/.env"
echo "   1. Go to: https://cloudinary.com/console"
echo "   2. Copy Cloud Name, API Key, and API Secret"
echo "   3. Replace placeholders in packages/backend/.env"
echo ""
echo "JWT secrets have been auto-generated securely."
```

**Usage**:
```bash
chmod +x setup-env.sh
./setup-env.sh
```

---

## Additional Services (Optional)

### SendGrid (Email Notifications)
For sending emails (product review notifications, payout confirmations):

1. Sign up: https://signup.sendgrid.com/
2. Get API key: Settings > API Keys > Create API Key
3. Add to `.env`:
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourapp.com
   ```

### Google OAuth (Social Login)
For Google Sign-In:

1. Go to: https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to `.env`:
   ```bash
   GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
   ```

---

**Need help?** Check `SESSION_START.md` for troubleshooting or consult the backend logs at `/tmp/backend.log`.
