import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCampaignInvitations1709100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create campaign_invitations table
    await queryRunner.createTable(
      new Table({
        name: 'campaign_invitations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'campaign_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'influencer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'invited_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'responded_at',
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

    // Add unique constraint for campaign_id + influencer_id
    await queryRunner.query(`
      ALTER TABLE campaign_invitations
      ADD CONSTRAINT "UQ_campaign_invitations_campaign_influencer"
      UNIQUE (campaign_id, influencer_id)
    `);

    // Add foreign key for campaign_id
    await queryRunner.createForeignKey(
      'campaign_invitations',
      new TableForeignKey({
        columnNames: ['campaign_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'campaigns',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for influencer_id
    await queryRunner.createForeignKey(
      'campaign_invitations',
      new TableForeignKey({
        columnNames: ['influencer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'influencers',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_campaign_invitations_campaign"
      ON "campaign_invitations" ("campaign_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_campaign_invitations_influencer"
      ON "campaign_invitations" ("influencer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_campaign_invitations_status"
      ON "campaign_invitations" ("status")
    `);

    // Create partial index for pending invitations (most frequently queried)
    await queryRunner.query(`
      CREATE INDEX "IDX_campaign_invitations_pending"
      ON "campaign_invitations" ("influencer_id", "status")
      WHERE status = 'PENDING'
    `);

    // Add table comment
    await queryRunner.query(`
      COMMENT ON TABLE campaign_invitations IS 'Tracks invitations for SPECIFIC campaigns'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN campaign_invitations.status IS 'PENDING = waiting for response, ACCEPTED = can create links, DECLINED = rejected invitation'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_campaign_invitations_pending"`);
    await queryRunner.query(`DROP INDEX "IDX_campaign_invitations_status"`);
    await queryRunner.query(`DROP INDEX "IDX_campaign_invitations_influencer"`);
    await queryRunner.query(`DROP INDEX "IDX_campaign_invitations_campaign"`);

    // Drop foreign keys
    const table = await queryRunner.getTable('campaign_invitations');
    if (table) {
      const campaignFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('campaign_id') !== -1);
      if (campaignFk) {
        await queryRunner.dropForeignKey('campaign_invitations', campaignFk);
      }

      const influencerFk = table.foreignKeys.find((fk) => fk.columnNames.indexOf('influencer_id') !== -1);
      if (influencerFk) {
        await queryRunner.dropForeignKey('campaign_invitations', influencerFk);
      }
    }

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE campaign_invitations
      DROP CONSTRAINT "UQ_campaign_invitations_campaign_influencer"
    `);

    // Drop table
    await queryRunner.dropTable('campaign_invitations');
  }
}
