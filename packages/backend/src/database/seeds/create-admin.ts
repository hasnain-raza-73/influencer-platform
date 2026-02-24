/**
 * Admin Seed Script
 * Run with: npm run seed:admin
 * Creates the default admin user: admin@platform.com / Admin@123456!
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository('users');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@platform.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456!';

  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin user "${adminEmail}" already exists. Skipping.`);
    await AppDataSource.destroy();
    return;
  }

  const password_hash = await bcrypt.hash(adminPassword, 10);

  await userRepo.save(
    userRepo.create({
      email: adminEmail,
      password_hash,
      role: 'ADMIN',
      status: 'ACTIVE',
      email_verified: true,
    }),
  );

  console.log(`✅ Admin user created: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Change this password after first login!`);

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
