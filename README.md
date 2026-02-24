# Influencer-Brand Platform

A marketplace platform connecting brands with influencers for product promotion with advanced tracking and analytics.

## 🚀 Features

- **Dual User Types**: Separate experiences for Brands and Influencers
- **Product Management**: Brands can create and manage products
- **Tracking System**: Advanced click and conversion tracking with attribution
- **Analytics Dashboard**: Comprehensive performance metrics
- **Partnership System**: Direct hiring and application system
- **Mobile First**: React Native app for both iOS and Android
- **Real-time Notifications**: Push notifications via FCM
- **Secure Authentication**: JWT + OAuth (Google, Apple)

## 📁 Project Structure

```
influencer-brand-platform/
├── packages/
│   ├── web/             # Next.js web application
│   ├── mobile/          # React Native app (iOS & Android)
│   ├── backend/         # NestJS API server
│   └── shared/          # Shared types and utilities
├── docs/                # Additional documentation
├── scripts/             # Build and deployment scripts
└── [config files]       # Turborepo, Docker, etc.
```

## 🛠️ Tech Stack

- **Monorepo**: Turborepo
- **Backend**: NestJS + TypeScript + PostgreSQL + Redis
- **Web Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Mobile**: React Native + TypeScript
- **State Management**: Zustand (Web), React Query + Zustand (Mobile)
- **Cloud**: AWS (RDS, S3, CloudFront, ECS)
- **Authentication**: JWT + OAuth
- **Notifications**: Firebase Cloud Messaging

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+ (via Docker)
- Redis 7+ (via Docker)
- React Native development environment
  - For iOS: Xcode 14+
  - For Android: Android Studio + JDK 11+

## 🏃 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd influencer-brand-platform
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Database Services

```bash
npm run docker:up
```

This starts PostgreSQL and Redis containers.

### 4. Run Database Migrations

```bash
cd packages/backend
npm run typeorm migration:run
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend
cd packages/backend
npm run start:dev

# Terminal 2: Start web frontend
cd packages/web
npm run dev

# Terminal 3: Start mobile app (optional)
cd packages/mobile
npm run ios  # or npm run android
```

- Backend API runs on: http://localhost:3000
- Web app runs on: http://localhost:3001
- Mobile app runs on: Expo or device

## 🌐 Web App Setup

The web application is a Next.js 15 application with the App Router.

```bash
cd packages/web
npm install
npm run dev
```

Access the web app at: http://localhost:3001

### Web App Features
- **Brand Portal**: Product & campaign management, analytics dashboard
- **Influencer Hub**: Campaign discovery, tracking links, payout management
- **Public Pages**: Landing page, tracking redirect system
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Automatic data refresh and loading states

## 📱 Mobile App Setup

### iOS

```bash
cd packages/mobile
npx pod-install ios
npm run ios
```

### Android

```bash
cd packages/mobile
npm run android
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests
cd packages/backend
npm run test

# Run mobile tests
cd packages/mobile
npm run test
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System design and data flow
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Database Schema](./DATABASE_SCHEMA.md) - Database structure
- [Tracking Specification](./TRACKING_SPEC.md) - Tracking system details
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Progress Tracker](./PROGRESS.md) - Development roadmap

## 🔑 Key Concepts

### Tracking System

The platform uses a sophisticated tracking system:

1. **Influencer shares tracking link**: `track.yourapp.com/c/ABC123/PROD456`
2. **User clicks** → Cookie set → Redirect to brand site
3. **User purchases** → Pixel/webhook fires → Attribution
4. **Commission calculated** → Influencer earns

**Attribution Window**: 30 days (last-click model)

### User Roles

**Brands:**
- Create and manage products
- View analytics and sales data
- Hire influencers
- Approve/reject conversions

**Influencers:**
- Browse and select products
- Generate tracking links
- View earnings and performance
- Apply to promote products

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

Quick deploy to AWS:

```bash
# Build and push Docker image
npm run deploy:backend

# Deploy mobile apps
npm run deploy:mobile
```

## 📊 Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_HOST=localhost
DATABASE_NAME=influencer_platform

# JWT
JWT_SECRET=your-secret-key

# AWS
AWS_REGION=us-east-1
S3_BUCKET_PRODUCTS=your-bucket

# OAuth
GOOGLE_CLIENT_ID=your-client-id
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

### Code Style

- TypeScript strict mode
- Prettier for formatting
- ESLint for linting
- Conventional commits

## 📝 Development Workflow

### Before Starting

1. Read `PROGRESS.md` for current status
2. Read `ARCHITECTURE.md` for system design
3. Check `.clinerules` for coding guidelines

### Making Changes

1. Create feature branch
2. Write tests
3. Update documentation
4. Run linters: `npm run lint`
5. Run tests: `npm run test`
6. Commit with conventional commits

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs influencer-platform-db
```

### Mobile App Issues

```bash
# Clear cache
cd packages/mobile
npm start -- --reset-cache

# Reinstall pods (iOS)
cd ios && pod install
```

### Backend Issues

```bash
# Check logs
cd packages/backend
npm run start:dev

# Reset database
npm run typeorm schema:drop
npm run typeorm migration:run
```

## 📞 Support

- Documentation: See `/docs` folder
- Issues: GitHub Issues
- Email: support@yourapp.com

## 📄 License

Copyright (c) 2024. All rights reserved.

## 🗺️ Roadmap

### Phase 1 (MVP - Weeks 1-10)
- [x] Project setup
- [x] Authentication system (JWT + role-based)
- [x] Product management (full CRUD)
- [x] Campaign management (create, pause, activate, end)
- [x] Tracking system (click tracking & conversion attribution)
- [x] Analytics & statistics (brand & influencer dashboards)
- [x] Payout system (balance tracking & payout requests)
- [x] Web dashboard (Next.js application)
- [ ] Mobile app (React Native)

### Phase 2 (Enhancement)
- [ ] Payment integration (Stripe Connect, PayPal)
- [ ] Advanced analytics (charts, time-series data)
- [ ] Influencer discovery & search
- [ ] Rating & review system
- [ ] Email notifications
- [ ] Webhook system for conversions

### Phase 3 (Scale)
- [ ] Multi-language support
- [ ] Advanced fraud detection
- [ ] API for third parties
- [ ] White-label options
- [ ] Multi-currency support

## 🙏 Acknowledgments

- NestJS team
- React Native community
- TypeORM contributors
