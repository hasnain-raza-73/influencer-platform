import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateTrackingTables1707700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tracking_links table
    await queryRunner.createTable(
      new Table({
        name: 'tracking_links',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'influencer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'unique_code',
            type: 'varchar',
            length: '32',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'clicks',
            type: 'integer',
            default: 0,
          },
          {
            name: 'conversions',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_sales',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'last_clicked_at',
            type: 'timestamp',
            isNullable: true,
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

    // Add unique constraint for influencer_id + product_id
    await queryRunner.createUniqueConstraint(
      'tracking_links',
      new TableUnique({
        name: 'UQ_tracking_links_influencer_product',
        columnNames: ['influencer_id', 'product_id'],
      }),
    );

    // Foreign keys for tracking_links
    await queryRunner.createForeignKey(
      'tracking_links',
      new TableForeignKey({
        columnNames: ['influencer_id'],
        referencedTableName: 'influencers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tracking_links',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for tracking_links
    await queryRunner.createIndex(
      'tracking_links',
      new TableIndex({
        name: 'idx_tracking_links_code',
        columnNames: ['unique_code'],
      }),
    );

    await queryRunner.createIndex(
      'tracking_links',
      new TableIndex({
        name: 'idx_tracking_links_influencer',
        columnNames: ['influencer_id'],
      }),
    );

    await queryRunner.createIndex(
      'tracking_links',
      new TableIndex({
        name: 'idx_tracking_links_product',
        columnNames: ['product_id'],
      }),
    );

    // Create clicks table
    await queryRunner.createTable(
      new Table({
        name: 'clicks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tracking_link_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'referrer',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'device_type',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'clicked_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign key for clicks
    await queryRunner.createForeignKey(
      'clicks',
      new TableForeignKey({
        columnNames: ['tracking_link_id'],
        referencedTableName: 'tracking_links',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for clicks
    await queryRunner.createIndex(
      'clicks',
      new TableIndex({
        name: 'idx_clicks_tracking_link',
        columnNames: ['tracking_link_id'],
      }),
    );

    await queryRunner.createIndex(
      'clicks',
      new TableIndex({
        name: 'idx_clicks_clicked_at',
        columnNames: ['clicked_at'],
      }),
    );

    await queryRunner.createIndex(
      'clicks',
      new TableIndex({
        name: 'idx_clicks_ip',
        columnNames: ['ip_address', 'clicked_at'],
      }),
    );

    // Create conversions table
    await queryRunner.createTable(
      new Table({
        name: 'conversions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tracking_link_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'influencer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'brand_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'order_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            name: 'commission_rate',
            type: 'decimal',
            precision: 5,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'commission_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
            default: "'PENDING'",
          },
          {
            name: 'fraud_score',
            type: 'integer',
            default: 0,
          },
          {
            name: 'fraud_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'clicked_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'converted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'approved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'paid_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
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

    // Add unique constraint for brand_id + order_id
    await queryRunner.createUniqueConstraint(
      'conversions',
      new TableUnique({
        name: 'UQ_conversions_brand_order',
        columnNames: ['brand_id', 'order_id'],
      }),
    );

    // Foreign keys for conversions
    await queryRunner.createForeignKey(
      'conversions',
      new TableForeignKey({
        columnNames: ['tracking_link_id'],
        referencedTableName: 'tracking_links',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversions',
      new TableForeignKey({
        columnNames: ['influencer_id'],
        referencedTableName: 'influencers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversions',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversions',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for conversions
    await queryRunner.createIndex(
      'conversions',
      new TableIndex({
        name: 'idx_conversions_tracking_link',
        columnNames: ['tracking_link_id'],
      }),
    );

    await queryRunner.createIndex(
      'conversions',
      new TableIndex({
        name: 'idx_conversions_influencer',
        columnNames: ['influencer_id', 'converted_at'],
      }),
    );

    await queryRunner.createIndex(
      'conversions',
      new TableIndex({
        name: 'idx_conversions_brand',
        columnNames: ['brand_id', 'converted_at'],
      }),
    );

    await queryRunner.createIndex(
      'conversions',
      new TableIndex({
        name: 'idx_conversions_order_id',
        columnNames: ['brand_id', 'order_id'],
      }),
    );

    await queryRunner.createIndex(
      'conversions',
      new TableIndex({
        name: 'idx_conversions_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop conversions table
    const conversionsTable = await queryRunner.getTable('conversions');
    if (conversionsTable) {
      const conversionsIndexes = ['idx_conversions_status', 'idx_conversions_order_id', 'idx_conversions_brand', 'idx_conversions_influencer', 'idx_conversions_tracking_link'];
      for (const indexName of conversionsIndexes) {
        await queryRunner.dropIndex('conversions', indexName);
      }

      const conversionsForeignKeys = conversionsTable.foreignKeys;
      for (const fk of conversionsForeignKeys) {
        await queryRunner.dropForeignKey('conversions', fk);
      }

      await queryRunner.dropTable('conversions');
    }

    // Drop clicks table
    const clicksTable = await queryRunner.getTable('clicks');
    if (clicksTable) {
      const clicksIndexes = ['idx_clicks_ip', 'idx_clicks_clicked_at', 'idx_clicks_tracking_link'];
      for (const indexName of clicksIndexes) {
        await queryRunner.dropIndex('clicks', indexName);
      }

      const clicksForeignKeys = clicksTable.foreignKeys;
      for (const fk of clicksForeignKeys) {
        await queryRunner.dropForeignKey('clicks', fk);
      }

      await queryRunner.dropTable('clicks');
    }

    // Drop tracking_links table
    const trackingLinksTable = await queryRunner.getTable('tracking_links');
    if (trackingLinksTable) {
      const trackingIndexes = ['idx_tracking_links_product', 'idx_tracking_links_influencer', 'idx_tracking_links_code'];
      for (const indexName of trackingIndexes) {
        await queryRunner.dropIndex('tracking_links', indexName);
      }

      const trackingForeignKeys = trackingLinksTable.foreignKeys;
      for (const fk of trackingForeignKeys) {
        await queryRunner.dropForeignKey('tracking_links', fk);
      }

      await queryRunner.dropTable('tracking_links');
    }
  }
}
