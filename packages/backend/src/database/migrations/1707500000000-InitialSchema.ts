import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1707500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "role" VARCHAR(20) NOT NULL CHECK (role IN ('BRAND', 'INFLUENCER')),
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
        "email_verified" BOOLEAN DEFAULT FALSE,
        "oauth_provider" VARCHAR(50),
        "oauth_id" VARCHAR(255),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for users
    await queryRunner.query(`
      CREATE INDEX "idx_users_email" ON "users"("email")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_users_oauth" ON "users"("oauth_provider", "oauth_id")
    `);

    // Create brands table
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid UNIQUE NOT NULL,
        "company_name" VARCHAR(255) NOT NULL,
        "website" VARCHAR(255),
        "logo_url" VARCHAR(500),
        "description" TEXT,
        "default_commission_rate" DECIMAL(5,4) DEFAULT 0.1000,
        "api_key" VARCHAR(64) UNIQUE NOT NULL,
        "pixel_id" VARCHAR(32) UNIQUE NOT NULL,
        "integration_type" VARCHAR(20) DEFAULT 'PIXEL' CHECK (integration_type IN ('PIXEL', 'WEBHOOK', 'API')),
        "status" VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'SUSPENDED')),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_brands_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for brands
    await queryRunner.query(`
      CREATE INDEX "idx_brands_user_id" ON "brands"("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_brands_api_key" ON "brands"("api_key")
    `);

    // Create influencers table
    await queryRunner.query(`
      CREATE TABLE "influencers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid UNIQUE NOT NULL,
        "display_name" VARCHAR(255) NOT NULL,
        "bio" TEXT,
        "avatar_url" VARCHAR(500),
        "social_instagram" VARCHAR(255),
        "social_tiktok" VARCHAR(255),
        "social_youtube" VARCHAR(255),
        "social_twitter" VARCHAR(255),
        "follower_count" INTEGER DEFAULT 0,
        "niche" VARCHAR(100)[],
        "rating" DECIMAL(3,2) DEFAULT 0.00,
        "total_sales" DECIMAL(12,2) DEFAULT 0.00,
        "total_earnings" DECIMAL(12,2) DEFAULT 0.00,
        "total_clicks" INTEGER DEFAULT 0,
        "total_conversions" INTEGER DEFAULT 0,
        "status" VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'SUSPENDED')),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_influencers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for influencers
    await queryRunner.query(`
      CREATE INDEX "idx_influencers_user_id" ON "influencers"("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_influencers_niche" ON "influencers" USING GIN("niche")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_influencers_rating" ON "influencers"("rating" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "influencers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "brands" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
  }
}
