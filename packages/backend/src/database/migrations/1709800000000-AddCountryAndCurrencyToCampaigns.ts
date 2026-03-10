import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryAndCurrencyToCampaigns1709800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ADD COLUMN "country" VARCHAR(2),
      ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'USD'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      DROP COLUMN "country",
      DROP COLUMN "currency"
    `);
  }
}
