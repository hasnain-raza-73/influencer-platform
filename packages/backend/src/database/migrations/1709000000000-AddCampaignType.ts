import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCampaignType1709000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add campaign_type column with enum type
    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'campaign_type',
        type: 'enum',
        enum: ['OPEN', 'SPECIFIC'],
        default: "'OPEN'",
        isNullable: false,
      }),
    );

    // Update existing campaigns to OPEN type
    await queryRunner.query(`
      UPDATE campaigns
      SET campaign_type = 'OPEN'
      WHERE campaign_type IS NULL
    `);

    // Add comment to column for documentation
    await queryRunner.query(`
      COMMENT ON COLUMN campaigns.campaign_type IS 'OPEN = visible to all influencers, SPECIFIC = invitation only'
    `);

    // Create index for campaign type queries
    await queryRunner.query(`
      CREATE INDEX "IDX_campaigns_campaign_type" ON "campaigns" ("campaign_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_campaigns_campaign_type"`);

    // Drop column
    await queryRunner.dropColumn('campaigns', 'campaign_type');
  }
}
