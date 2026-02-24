import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load test environment - clear existing env first
process.env.DATABASE_NAME = undefined;
dotenv.config({ path: '.env.test' });

async function setupTestDatabase() {
  // Hardcode test database name to prevent accidents
  const testDbName = 'influencer_platform_test';

  console.log('Setting up test database...');
  console.log(`Target database: ${testDbName}`);

  // First, connect to postgres database to create test database if it doesn't exist
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default database
  });

  try {
    await adminDataSource.initialize();
    console.log('Connected to PostgreSQL');

    // Drop test database if exists and recreate
    await adminDataSource.query(`DROP DATABASE IF EXISTS ${testDbName}`);
    console.log(`Dropped database ${testDbName} if it existed`);

    await adminDataSource.query(`CREATE DATABASE ${testDbName}`);
    console.log(`Created database ${testDbName}`);

    await adminDataSource.destroy();

    // Now connect to test database and run migrations
    const testDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: testDbName,
      entities: [join(__dirname, '..', 'src', 'modules', '**', '*.entity{.ts,.js}')],
      migrations: [join(__dirname, '..', 'src', 'database', 'migrations', '*{.ts,.js}')],
      synchronize: false,
      logging: false,
    });

    await testDataSource.initialize();
    console.log('Connected to test database');

    // Run migrations
    await testDataSource.runMigrations();
    console.log('Migrations completed successfully');

    await testDataSource.destroy();
    console.log('Test database setup complete!');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDatabase();
