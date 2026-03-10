import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTrackingLinkProducts1709400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tracking_link_products junction table
    await queryRunner.createTable(
      new Table({
        name: 'tracking_link_products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tracking_link_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'display_order',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add unique constraint for tracking_link_id + product_id
    await queryRunner.query(`
      ALTER TABLE tracking_link_products
      ADD CONSTRAINT "UQ_tracking_link_products_link_product"
      UNIQUE (tracking_link_id, product_id)
    `);

    // Add foreign key for tracking_link_id
    await queryRunner.createForeignKey(
      'tracking_link_products',
      new TableForeignKey({
        columnNames: ['tracking_link_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tracking_links',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for product_id
    await queryRunner.createForeignKey(
      'tracking_link_products',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_tracking_link_products_link"
      ON "tracking_link_products" ("tracking_link_id", "display_order")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tracking_link_products_product"
      ON "tracking_link_products" ("product_id")
    `);

    // Add table comment
    await queryRunner.query(`
      COMMENT ON TABLE tracking_link_products IS 'Junction table for multi-product tracking links (2-10 products per link)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN tracking_link_products.display_order IS 'Order in which products appear on landing page (0-indexed)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tracking_link_products_product"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tracking_link_products_link"`);

    // Drop foreign keys
    const table = await queryRunner.getTable('tracking_link_products');
    if (table) {
      const linkFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('tracking_link_id') !== -1);
      if (linkFk) {
        await queryRunner.dropForeignKey('tracking_link_products', linkFk);
      }

      const productFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('product_id') !== -1);
      if (productFk) {
        await queryRunner.dropForeignKey('tracking_link_products', productFk);
      }
    }

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE tracking_link_products
      DROP CONSTRAINT IF EXISTS "UQ_tracking_link_products_link_product"
    `);

    // Drop table
    await queryRunner.dropTable('tracking_link_products');
  }
}
