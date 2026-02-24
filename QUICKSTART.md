# Quick Start Guide

Welcome to the Influencer-Brand Platform! This guide will get you up and running in 10 minutes.

## What You're Building

A marketplace connecting brands with influencers for product promotion, featuring:
- Advanced tracking and attribution system
- Real-time analytics
- Mobile-first experience for both brands and influencers
- Secure payment tracking and commission calculation

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Docker installed (`docker --version`)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] For mobile: Xcode (iOS) or Android Studio (Android)

## 5-Minute Setup

### 1. Install Dependencies (2 min)

```bash
cd influencer-brand-platform
npm install
```

This installs all dependencies for backend, mobile, and shared packages.

### 2. Start Databases (1 min)

```bash
npm run docker:up
```

This starts PostgreSQL and Redis in Docker containers.

### 3. Setup Environment (1 min)

```bash
cp .env.example .env
```

The default values work for local development. No changes needed!

### 4. Initialize Database (1 min)

```bash
cd packages/backend
npm run migration:run
cd ../..
```

This creates all database tables.

### 5. Start Development Servers (30 sec)

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run start:dev
```

Wait for: `🚀 Server running on http://localhost:3000/v1`

**Terminal 2 - Mobile App:**
```bash
cd packages/mobile
npm run ios  # or: npm run android
```

## Test It Works

### Backend Health Check

```bash
curl http://localhost:3000/v1/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Mobile App

You should see "Influencer-Brand Platform - Mobile App Coming Soon"

## What to Build First

Follow `PROGRESS.md` for the recommended development order:

1. **Week 1-2**: Authentication system
2. **Week 3-4**: Products and tracking system
3. **Week 5-6**: Analytics
4. **Week 7-8**: Partnerships and polish

## Key Files to Read

Before coding, read these in order:

1. **`.clinerules`** - Development guidelines
2. **`ARCHITECTURE.md`** - System design
3. **`TRACKING_SPEC.md`** - Core tracking feature
4. **`DATABASE_SCHEMA.md`** - Data models
5. **`API_DOCUMENTATION.md`** - API reference

## Working with Claude Code

When using Claude Code, always start by saying:

> "Read the .clinerules and PROGRESS.md files, then help me implement [feature]"

Claude will follow the project guidelines automatically.

## Project Structure Overview

```
influencer-brand-platform/
├── packages/
│   ├── mobile/       ← React Native app
│   ├── backend/      ← NestJS API
│   └── shared/       ← Shared types
├── .clinerules       ← IMPORTANT: Read this first
├── ARCHITECTURE.md   ← System design
├── PROGRESS.md       ← Development roadmap
└── [other docs]
```

## Common Commands

```bash
# Start everything
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# View database
docker exec -it influencer-platform-db psql -U postgres -d influencer_platform

# View logs
npm run docker:logs

# Clean everything
npm run clean && npm install
```

## Next Steps

1. ✅ Setup complete? Great!
2. 📖 Read `.clinerules` thoroughly
3. 🗺️ Review `PROGRESS.md` for current sprint
4. 🏗️ Start building authentication module
5. 💬 Use Claude Code to accelerate development

## Getting Help

- Read docs in `/docs` folder
- Check `PROGRESS.md` for known issues
- Review package-specific `.clinerules` files

## Tips for Success

1. **Read before coding**: The `.clinerules` file contains critical guidelines
2. **Follow the roadmap**: `PROGRESS.md` has the optimal build order
3. **Test as you go**: Don't wait until the end
4. **Use Claude Code**: It understands the entire architecture
5. **Focus on tracking**: This is the core feature - get it right

## Ready to Code?

Start with authentication:

```bash
cd packages/backend/src/modules/auth
# Create auth.module.ts, auth.controller.ts, auth.service.ts
```

Or use Claude Code:

> "Read .clinerules and help me implement the authentication module following NestJS best practices"

Happy coding! 🚀
