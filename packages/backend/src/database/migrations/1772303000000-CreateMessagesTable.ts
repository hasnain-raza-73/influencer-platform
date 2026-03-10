import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1772303000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sender_id" uuid NOT NULL,
        "sender_type" VARCHAR(20) NOT NULL,
        "brand_id" uuid,
        "influencer_id" uuid,
        "message" TEXT NOT NULL,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "campaign_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "FK_messages_brand" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_messages_influencer" FOREIGN KEY ("influencer_id") REFERENCES "influencers"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_brand_influencer" ON "messages" ("brand_id", "influencer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_created_at" ON "messages" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_is_read" ON "messages" ("is_read")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_messages_is_read"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_brand_influencer"`);
    await queryRunner.query(`DROP TABLE "messages"`);
  }
}
