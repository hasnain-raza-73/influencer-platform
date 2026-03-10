import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeProductIdNullable1709600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make product_id nullable in tracking_links table
    // This is needed for multi-product links that use the junction table
    await queryRunner.query(`
      ALTER TABLE tracking_links
      ALTER COLUMN product_id DROP NOT NULL
    `);

    // Add comment
    await queryRunner.query(`
      COMMENT ON COLUMN tracking_links.product_id IS 'Single product ID (NULL for multi-product links)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert product_id to NOT NULL
    await queryRunner.query(`
      ALTER TABLE tracking_links
      ALTER COLUMN product_id SET NOT NULL
    `);
  }
}
