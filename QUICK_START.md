# Quick Start Commands - Authentication & Database

## 🚀 Get Started in 5 Minutes

### 1️⃣ Start Docker Desktop
Open Docker Desktop application on your Mac and wait for it to start.

### 2️⃣ Start Database (Terminal 1)
```bash
cd /Users/hasnainraza/Desktop/My\ Stores/influencer-platform

# Start PostgreSQL
docker run -d \
  --name influencer-platform-db \
  -e POSTGRES_DB=influencer_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

### 3️⃣ Install & Setup Backend (Terminal 1)
```bash
cd packages/backend

# Install dependencies
npm install

# Run database migration
npm run migration:run

# Start backend server
npm run start:dev
```

Wait for: `🚀 Server running on http://localhost:3000/v1`

### 4️⃣ Test API (Terminal 2)
```bash
# Register a brand user
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@brand.com","password":"password123","role":"BRAND"}'

# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@brand.com","password":"password123"}'
```

## 📝 Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Register new user (Brand or Influencer) |
| POST | `/v1/auth/login` | Login with email/password |
| POST | `/v1/auth/refresh` | Refresh access token |
| GET | `/v1/auth/me` | Get current user (requires auth) |

## 🛑 Stopping Services

```bash
# Stop backend server
# Press Ctrl+C in the terminal running the server

# Stop PostgreSQL container
docker stop influencer-platform-db

# Remove PostgreSQL container (if needed)
docker rm influencer-platform-db
```

## 🔧 Useful Commands

```bash
# View database
docker exec -it influencer-platform-db psql -U postgres -d influencer_platform

# View tables
\dt

# View users
SELECT * FROM users;

# Exit database
\q

# Check if backend is running
curl http://localhost:3000/v1

# View Docker containers
docker ps

# View backend logs
# (in the terminal where npm run start:dev is running)
```

## 📂 Important Files

- **Environment**: `packages/backend/.env`
- **Migration**: `packages/backend/src/database/migrations/`
- **Entities**: `packages/backend/src/modules/*/`
- **Auth Module**: `packages/backend/src/modules/auth/`

## ✅ Success Checklist

- [ ] Docker Desktop is running
- [ ] PostgreSQL container started
- [ ] npm install completed
- [ ] Migration ran successfully
- [ ] Backend server started on port 3000
- [ ] Can register a new user
- [ ] Can login and receive JWT token

## 🎯 Next Steps

Once authentication is working:
1. Implement Products module
2. Build Tracking system
3. Add Analytics
4. Build mobile app screens
5. Deploy to production

## 🆘 Need Help?

- Check `AUTHENTICATION_COMPLETE.md` for detailed documentation
- Check `packages/backend/SETUP.md` for troubleshooting
- Review `.env` file for configuration

---

**Status**: ✅ Authentication & Database Setup Complete!
