import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddProductIdToClicks1709500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add product_id column to clicks table
    await queryRunner.addColumn(
      'clicks',
      new TableColumn({
        name: 'product_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key for product_id
    await queryRunner.createForeignKey(
      'clicks',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'SET NULL',
      }),
    );

    // Create index for product_id
    await queryRunner.query(`
      CREATE INDEX "IDX_clicks_product"
      ON "clicks" ("product_id")
    `);

    // Add column comment
    await queryRunner.query(`
      COMMENT ON COLUMN clicks.product_id IS 'For multi-product links, tracks which specific product was clicked'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clicks_product"`);

    // Drop foreign key
    const table = await queryRunner.getTable('clicks');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('product_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('clicks', foreignKey);
      }
    }

    // Drop column
    await queryRunner.dropColumn('clicks', 'product_id');
  }
}
