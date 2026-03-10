import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1772303100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for notification types
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'MESSAGE',
        'CAMPAIGN_INVITE',
        'CAMPAIGN_ACCEPTED',
        'CAMPAIGN_DECLINED',
        'NEW_CONVERSION',
        'PAYOUT_REQUESTED',
        'PAYOUT_APPROVED',
        'PAYOUT_PAID',
        'PRODUCT_APPROVED',
        'PRODUCT_REJECTED'
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "user_type" VARCHAR(20) NOT NULL,
        "type" "notification_type_enum" NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "message" TEXT NOT NULL,
        "link" VARCHAR(500),
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user" ON "notifications" ("user_id", "user_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_notifications_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_is_read"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_user"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
  }
}
