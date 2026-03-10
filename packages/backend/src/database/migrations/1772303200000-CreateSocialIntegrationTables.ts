import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSocialIntegrationTables1772303200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create social_accounts table
    await queryRunner.query(`
      CREATE TABLE "social_accounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "influencer_id" uuid NOT NULL,
        "platform" VARCHAR(20) NOT NULL,
        "platform_user_id" VARCHAR(255) NOT NULL,
        "platform_username" VARCHAR(255),
        "access_token" TEXT,
        "refresh_token" TEXT,
        "token_expires_at" TIMESTAMP,
        "is_verified" BOOLEAN NOT NULL DEFAULT false,
        "verification_level" VARCHAR(20),
        "last_synced_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "FK_social_accounts_influencer" FOREIGN KEY ("influencer_id") REFERENCES "influencers"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_social_accounts_platform_user" UNIQUE ("platform", "platform_user_id")
      )
    `);

    // Create social_metrics table
    await queryRunner.query(`
      CREATE TABLE "social_metrics" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "social_account_id" uuid NOT NULL,
        "followers_count" INTEGER NOT NULL DEFAULT 0,
        "following_count" INTEGER NOT NULL DEFAULT 0,
        "posts_count" INTEGER NOT NULL DEFAULT 0,
        "engagement_rate" DECIMAL(5,2),
        "avg_likes" INTEGER NOT NULL DEFAULT 0,
        "avg_comments" INTEGER NOT NULL DEFAULT 0,
        "avg_views" INTEGER NOT NULL DEFAULT 0,
        "audience_demographics" JSONB,
        "synced_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "FK_social_metrics_account" FOREIGN KEY ("social_account_id") REFERENCES "social_accounts"("id") ON DELETE CASCADE
      )
    `);

    // Create social_audience_insights table
    await queryRunner.query(`
      CREATE TABLE "social_audience_insights" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "social_account_id" uuid NOT NULL,
        "insight_type" VARCHAR(50) NOT NULL,
        "insight_data" JSONB,
        "synced_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "FK_social_insights_account" FOREIGN KEY ("social_account_id") REFERENCES "social_accounts"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_social_accounts_influencer" ON "social_accounts" ("influencer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_accounts_platform" ON "social_accounts" ("platform")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_accounts_verified" ON "social_accounts" ("is_verified")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_metrics_account" ON "social_metrics" ("social_account_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_metrics_synced" ON "social_metrics" ("synced_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_insights_account" ON "social_audience_insights" ("social_account_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_social_insights_type" ON "social_audience_insights" ("insight_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_social_insights_type"`);
    await queryRunner.query(`DROP INDEX "IDX_social_insights_account"`);
    await queryRunner.query(`DROP INDEX "IDX_social_metrics_synced"`);
    await queryRunner.query(`DROP INDEX "IDX_social_metrics_account"`);
    await queryRunner.query(`DROP INDEX "IDX_social_accounts_verified"`);
    await queryRunner.query(`DROP INDEX "IDX_social_accounts_platform"`);
    await queryRunner.query(`DROP INDEX "IDX_social_accounts_influencer"`);

    // Drop tables (in reverse order due to foreign keys)
    await queryRunner.query(`DROP TABLE "social_audience_insights"`);
    await queryRunner.query(`DROP TABLE "social_metrics"`);
    await queryRunner.query(`DROP TABLE "social_accounts"`);
  }
}
