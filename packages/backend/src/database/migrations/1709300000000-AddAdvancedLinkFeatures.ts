import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAdvancedLinkFeatures1709300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add custom_slug column
    await queryRunner.addColumn(
      'tracking_links',
      new TableColumn({
        name: 'custom_slug',
        type: 'varchar',
        length: '100',
        isNullable: true,
        isUnique: false, // Will add partial unique index separately
      }),
    );

    // Add is_bio_link column
    await queryRunner.addColumn(
      'tracking_links',
      new TableColumn({
        name: 'is_bio_link',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    // Add qr_code_url column
    await queryRunner.addColumn(
      'tracking_links',
      new TableColumn({
        name: 'qr_code_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );

    // Add landing_page_config column (JSONB)
    await queryRunner.addColumn(
      'tracking_links',
      new TableColumn({
        name: 'landing_page_config',
        type: 'jsonb',
        default: "'{}'",
        isNullable: false,
      }),
    );

    // Create partial unique index for custom_slug (only when not NULL)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_tracking_links_custom_slug"
      ON "tracking_links" ("custom_slug")
      WHERE custom_slug IS NOT NULL
    `);

    // Create index for bio links
    await queryRunner.query(`
      CREATE INDEX "IDX_tracking_links_bio_links"
      ON "tracking_links" ("influencer_id", "is_bio_link")
      WHERE is_bio_link = TRUE
    `);

    // Add column comments
    await queryRunner.query(`
      COMMENT ON COLUMN tracking_links.custom_slug IS 'Custom short URL slug (e.g., "my-link" for link.co/my-link)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN tracking_links.is_bio_link IS 'Whether this link appears in Link-in-Bio page'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN tracking_links.qr_code_url IS 'Cloudinary URL of generated QR code'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN tracking_links.landing_page_config IS 'JSON config for landing page appearance (title, description, theme)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tracking_links_bio_links"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tracking_links_custom_slug"`);

    // Drop columns
    await queryRunner.dropColumn('tracking_links', 'landing_page_config');
    await queryRunner.dropColumn('tracking_links', 'qr_code_url');
    await queryRunner.dropColumn('tracking_links', 'is_bio_link');
    await queryRunner.dropColumn('tracking_links', 'custom_slug');
  }
}
