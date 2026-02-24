import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminRoleAndProductReview1708000000000 implements MigrationInterface {
  name = 'AdminRoleAndProductReview1708000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing role check constraint and add ADMIN as allowed value
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check"`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK (role IN ('BRAND', 'INFLUENCER', 'ADMIN'))`);

    // Create product_review_status enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "product_review_status_enum" AS ENUM (
          'PENDING_REVIEW',
          'APPROVED',
          'NEEDS_REVISION',
          'REJECTED'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Add review_status column to products
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD COLUMN "review_status" "product_review_status_enum" NOT NULL DEFAULT 'PENDING_REVIEW',
        ADD COLUMN "review_notes" TEXT,
        ADD COLUMN "image_urls" TEXT[] DEFAULT '{}'
    `);

    // Migrate existing image_url values into image_urls array
    await queryRunner.query(`
      UPDATE "products"
      SET "image_urls" = ARRAY["image_url"]
      WHERE "image_url" IS NOT NULL AND "image_url" <> ''
    `);

    // Index for fast review queue queries
    await queryRunner.query(`
      CREATE INDEX "idx_products_review_status" ON "products" ("review_status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_products_review_status"`);
    await queryRunner.query(`
      ALTER TABLE "products"
        DROP COLUMN "image_urls",
        DROP COLUMN "review_notes",
        DROP COLUMN "review_status"
    `);
    await queryRunner.query(`DROP TYPE "product_review_status_enum"`);
    // Note: PostgreSQL does not support removing enum values; ADMIN stays in user_role_enum
  }
}
