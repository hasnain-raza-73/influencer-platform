# Backend Source Code

## Structure

- `modules/` - Feature modules (auth, products, tracking, etc.)
- `common/` - Shared code (config, guards, interceptors)
- `database/` - Migrations and seed data
- `jobs/` - Scheduled jobs (analytics aggregation)

## Module Pattern

Each module contains:
- `module.ts` - Module definition
- `controller.ts` - HTTP endpoints
- `service.ts` - Business logic
- `entities/` - TypeORM entities
- `dto/` - Data transfer objects

## Next Steps

1. Implement auth module
2. Create database migrations
3. Build tracking system
4. Set up analytics jobs
5. Configure AWS services
