import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePayoutsTable1707800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payouts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'influencer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'brand_id',
            type: 'uuid',
            isNullable: true,
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
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'payout_method',
            type: 'enum',
            enum: ['bank_transfer', 'paypal', 'stripe', 'wise', 'other'],
            isNullable: false,
          },
          {
            name: 'payment_details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'conversion_ids',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'requested_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'transaction_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'failure_reason',
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

    // Add foreign key for influencer_id
    await queryRunner.createForeignKey(
      'payouts',
      new TableForeignKey({
        columnNames: ['influencer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'influencers',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for brand_id
    await queryRunner.createForeignKey(
      'payouts',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'brands',
        onDelete: 'SET NULL',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(`CREATE INDEX "IDX_payouts_influencer_id" ON "payouts" ("influencer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payouts_status" ON "payouts" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_payouts_created_at" ON "payouts" ("created_at")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_payouts_influencer_status" ON "payouts" ("influencer_id", "status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_payouts_influencer_status"`);
    await queryRunner.query(`DROP INDEX "IDX_payouts_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_payouts_status"`);
    await queryRunner.query(`DROP INDEX "IDX_payouts_influencer_id"`);

    // Drop foreign keys
    const table = await queryRunner.getTable('payouts');
    if (table) {
      const influencerFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('influencer_id') !== -1);
      if (influencerFk) {
        await queryRunner.dropForeignKey('payouts', influencerFk);
      }

      const brandFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('brand_id') !== -1);
      if (brandFk) {
        await queryRunner.dropForeignKey('payouts', brandFk);
      }
    }

    // Drop table
    await queryRunner.dropTable('payouts');
  }
}
