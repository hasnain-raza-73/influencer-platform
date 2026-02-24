import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProductsTable1707600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'brand_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'commission_rate',
            type: 'decimal',
            precision: 5,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'product_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'],
            default: "'ACTIVE'",
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

    // Add foreign key for brand_id
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'idx_products_brand_id',
        columnNames: ['brand_id'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'idx_products_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'idx_products_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('products', 'idx_products_status');
    await queryRunner.dropIndex('products', 'idx_products_category');
    await queryRunner.dropIndex('products', 'idx_products_brand_id');

    // Drop foreign key
    const table = await queryRunner.getTable('products');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('brand_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('products', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('products');
  }
}
