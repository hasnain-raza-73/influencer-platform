# Complete File Structure

```
influencer-brand-platform/
│
├── 📄 Root Configuration Files
│   ├── .clinerules                    ← CRITICAL: Project guidelines for Claude
│   ├── .env.example                   ← Environment variables template
│   ├── .gitignore                     ← Git ignore rules
│   ├── docker-compose.yml             ← Local development databases
│   ├── package.json                   ← Root package (Turborepo)
│   ├── turbo.json                     ← Monorepo configuration
│   ├── README.md                      ← Main project README
│   ├── QUICKSTART.md                  ← 10-minute setup guide
│   └── FILE_STRUCTURE.md              ← This file
│
├── 📚 Documentation
│   ├── ARCHITECTURE.md                ← System design and data flow
│   ├── PROGRESS.md                    ← Development roadmap and sprint tracking
│   ├── TRACKING_SPEC.md               ← Tracking system specification
│   ├── DATABASE_SCHEMA.md             ← Complete database schema
│   ├── API_DOCUMENTATION.md           ← Full API reference
│   ├── DEPLOYMENT.md                  ← Production deployment guide
│   └── docs/
│       └── DEVELOPMENT.md             ← Development workflow guide
│
├── 📦 packages/
│   │
│   ├── 📱 mobile/                     ← React Native App
│   │   ├── .clinerules                ← Mobile-specific guidelines
│   │   ├── package.json               ← Mobile dependencies
│   │   ├── tsconfig.json              ← TypeScript config
│   │   ├── app.json                   ← React Native config
│   │   ├── babel.config.js            ← Babel configuration
│   │   ├── metro.config.js            ← Metro bundler config
│   │   ├── index.js                   ← App entry point
│   │   ├── App.tsx                    ← Root component
│   │   ├── android/                   ← Android native code
│   │   ├── ios/                       ← iOS native code
│   │   └── src/
│   │       ├── README.md              ← Mobile source guide
│   │       ├── navigation/
│   │       │   ├── AppNavigator.tsx
│   │       │   ├── AuthNavigator.tsx
│   │       │   ├── InfluencerNavigator.tsx
│   │       │   └── BrandNavigator.tsx
│   │       ├── screens/
│   │       │   ├── auth/
│   │       │   │   ├── LoginScreen.tsx
│   │       │   │   ├── RegisterScreen.tsx
│   │       │   │   └── RoleSelectionScreen.tsx
│   │       │   ├── influencer/
│   │       │   │   ├── DashboardScreen.tsx
│   │       │   │   ├── BrandMarketplaceScreen.tsx
│   │       │   │   ├── ProductBrowserScreen.tsx
│   │       │   │   ├── MyProductsScreen.tsx
│   │       │   │   ├── TrackingLinksScreen.tsx
│   │       │   │   ├── AnalyticsScreen.tsx
│   │       │   │   ├── EarningsScreen.tsx
│   │       │   │   └── ProfileScreen.tsx
│   │       │   └── brand/
│   │       │       ├── DashboardScreen.tsx
│   │       │       ├── CreateProductScreen.tsx
│   │       │       ├── ManageProductsScreen.tsx
│   │       │       ├── FindInfluencersScreen.tsx
│   │       │       ├── MyInfluencersScreen.tsx
│   │       │       ├── AnalyticsScreen.tsx
│   │       │       ├── IntegrationScreen.tsx
│   │       │       └── ProfileScreen.tsx
│   │       ├── components/
│   │       │   ├── common/
│   │       │   ├── influencer/
│   │       │   └── brand/
│   │       ├── services/
│   │       │   ├── api/
│   │       │   ├── storage/
│   │       │   ├── notifications/
│   │       │   └── deeplink/
│   │       ├── hooks/
│   │       ├── store/
│   │       ├── utils/
│   │       ├── constants/
│   │       ├── types/
│   │       └── assets/
│   │
│   ├── 🔧 backend/                    ← NestJS API Server
│   │   ├── .clinerules                ← Backend-specific guidelines
│   │   ├── package.json               ← Backend dependencies
│   │   ├── tsconfig.json              ← TypeScript config
│   │   ├── nest-cli.json              ← NestJS CLI config
│   │   ├── Dockerfile                 ← Production Docker image
│   │   ├── .env.example               ← Backend env template
│   │   └── src/
│   │       ├── README.md              ← Backend source guide
│   │       ├── main.ts                ← Application entry
│   │       ├── app.module.ts          ← Root module
│   │       ├── app.controller.ts      ← Health check
│   │       ├── app.service.ts         ← Root service
│   │       ├── modules/               ← Feature modules
│   │       │   ├── auth/              ← Authentication
│   │       │   ├── users/             ← User management
│   │       │   ├── brands/            ← Brand profiles
│   │       │   ├── influencers/       ← Influencer profiles
│   │       │   ├── products/          ← Product catalog
│   │       │   ├── tracking/          ← Click & conversion tracking
│   │       │   ├── analytics/         ← Analytics & reporting
│   │       │   ├── partnerships/      ← Brand-Influencer partnerships
│   │       │   ├── webhooks/          ← Webhook handlers
│   │       │   ├── notifications/     ← Push & email notifications
│   │       │   └── upload/            ← S3 file upload
│   │       ├── common/                ← Shared code
│   │       │   ├── config/
│   │       │   ├── filters/
│   │       │   ├── interceptors/
│   │       │   ├── pipes/
│   │       │   ├── middleware/
│   │       │   └── utils/
│   │       ├── database/
│   │       │   ├── migrations/        ← TypeORM migrations
│   │       │   └── seeds/             ← Seed data
│   │       └── jobs/
│   │           ├── analytics-aggregation.job.ts
│   │           ├── commission-calculation.job.ts
│   │           └── cleanup.job.ts
│   │
│   └── 🔗 shared/                     ← Shared TypeScript Types
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types/
│           │   ├── user.types.ts
│           │   ├── product.types.ts
│           │   └── tracking.types.ts
│           ├── constants/
│           │   └── roles.ts
│           └── utils/
│
└── 🛠️ scripts/                        ← Build & deployment scripts
    ├── setup-dev.sh
    ├── seed-database.ts
    └── generate-api-docs.ts
```

## Key Files to Read First

1. **`.clinerules`** - Critical project guidelines
2. **`QUICKSTART.md`** - Get started in 10 minutes
3. **`PROGRESS.md`** - Current development status
4. **`ARCHITECTURE.md`** - System design
5. **`TRACKING_SPEC.md`** - Core feature specification

## File Naming Conventions

- **PascalCase**: React components, TypeScript types
- **kebab-case**: File names, directories, API endpoints
- **camelCase**: Functions, variables
- **UPPER_SNAKE_CASE**: Constants, environment variables

## Empty Directories

The following directories are created but empty (add files as needed):
- `packages/mobile/android/` - Android native code (generated by React Native)
- `packages/mobile/ios/` - iOS native code (generated by React Native)
- `packages/backend/src/modules/*` - Feature modules (implement per PROGRESS.md)
- `packages/mobile/src/components/*` - UI components (implement as needed)
