# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- Docker
- PostgreSQL client
- React Native environment

### First Time Setup

1. Install dependencies:
```bash
npm install
```

2. Start databases:
```bash
npm run docker:up
```

3. Run migrations:
```bash
cd packages/backend
npm run migration:run
```

4. Start development servers:
```bash
# Terminal 1: Backend
cd packages/backend && npm run start:dev

# Terminal 2: Mobile
cd packages/mobile && npm run ios
```

## Development Workflow

### Creating a New Feature

1. Check PROGRESS.md for current sprint
2. Create feature branch: `git checkout -b feature/name`
3. Follow module structure
4. Write tests
5. Update documentation
6. Submit PR

### Database Changes

```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

### Testing

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Troubleshooting

See main README.md for common issues.
