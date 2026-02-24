# Backend Setup Guide

## Prerequisites

1. Docker Desktop installed and running
2. Node.js 18+ installed
3. npm 9+ installed

## Setup Steps

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### 2. Install Dependencies
```bash
cd packages/backend
npm install
```

### 3. Environment Variables
The `.env` file has already been created from `.env.example`. Verify it contains:
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=influencer_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
```

### 4. Start Database Services
From the project root:
```bash
cd ../..
docker run -d --name influencer-platform-db \
  -e POSTGRES_DB=influencer_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

Or if you prefer docker-compose (if available):
```bash
docker-compose up -d postgres
```

### 5. Run Database Migrations
```bash
cd packages/backend
npm run migration:run
```

This will create all the tables (users, brands, influencers).

### 6. Start the Backend Server
```bash
npm run start:dev
```

The server should start on http://localhost:3000/v1

## Testing the API

### Health Check
```bash
curl http://localhost:3000/v1
```

### Register a New User (Brand)
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brand@test.com",
    "password": "password123",
    "role": "BRAND"
  }'
```

### Register a New User (Influencer)
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "influencer@test.com",
    "password": "password123",
    "role": "INFLUENCER"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brand@test.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### Get Current User Profile
```bash
curl -X GET http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Database Connection Error
- Make sure Docker is running
- Check if PostgreSQL container is running: `docker ps`
- Verify port 5432 is not in use by another service

### Migration Errors
- Make sure database is running first
- Check if .env file has correct database credentials
- Try running: `npm run migration:revert` then `npm run migration:run` again

### Module Import Errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Database Commands

### View Database
```bash
docker exec -it influencer-platform-db psql -U postgres -d influencer_platform
```

### List Tables
```sql
\dt
```

### View Users
```sql
SELECT * FROM users;
```

### Drop All Tables (Reset)
```bash
npm run migration:revert
npm run migration:run
```

## Next Steps

1. Implement Google OAuth (currently returns not implemented error)
2. Add email verification
3. Implement password reset
4. Add rate limiting
5. Implement Products module
6. Implement Tracking module
