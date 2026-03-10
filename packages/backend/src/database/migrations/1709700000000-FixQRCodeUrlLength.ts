import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixQRCodeUrlLength1709700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change qr_code_url from VARCHAR(500) to TEXT to accommodate base64 data URLs
    await queryRunner.query(`
      ALTER TABLE "tracking_links"
      ALTER COLUMN "qr_code_url" TYPE TEXT
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN tracking_links.qr_code_url IS 'Base64 data URL or Cloudinary URL of generated QR code'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to VARCHAR(500)
    // Note: This may fail if there are existing values longer than 500 characters
    await queryRunner.query(`
      ALTER TABLE "tracking_links"
      ALTER COLUMN "qr_code_url" TYPE VARCHAR(500)
    `);
  }
}
