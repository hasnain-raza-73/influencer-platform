import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCampaignsTable1707750000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'campaigns',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
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
            name: 'brand_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'active', 'paused', 'ended'],
            default: "'draft'",
          },
          {
            name: 'commission_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'fixed_commission',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'budget',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'max_conversions',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'target_product_ids',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'target_influencer_ids',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'min_followers',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'requirements',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'total_clicks',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_conversions',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_revenue',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'total_commission_paid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
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
      'campaigns',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'brands',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(`CREATE INDEX "IDX_campaigns_brand_id" ON "campaigns" ("brand_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_campaigns_status" ON "campaigns" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_campaigns_start_date" ON "campaigns" ("start_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_campaigns_end_date" ON "campaigns" ("end_date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_campaigns_end_date"`);
    await queryRunner.query(`DROP INDEX "IDX_campaigns_start_date"`);
    await queryRunner.query(`DROP INDEX "IDX_campaigns_status"`);
    await queryRunner.query(`DROP INDEX "IDX_campaigns_brand_id"`);

    // Drop foreign key
    const table = await queryRunner.getTable('campaigns');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('brand_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('campaigns', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('campaigns');
  }
}
