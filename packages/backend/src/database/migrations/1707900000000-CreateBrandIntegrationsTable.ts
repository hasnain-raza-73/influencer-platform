import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBrandIntegrationsTable1707900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'brand_integrations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'brand_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          // Meta Pixel (Conversions API)
          {
            name: 'meta_pixel_id',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'meta_access_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'meta_test_event_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'is_meta_enabled',
            type: 'boolean',
            default: false,
          },
          // Google Analytics 4 (Measurement Protocol)
          {
            name: 'ga4_measurement_id',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'ga4_api_secret',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'is_ga4_enabled',
            type: 'boolean',
            default: false,
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

    await queryRunner.createForeignKey(
      'brand_integrations',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'brands',
        onDelete: 'CASCADE',
        name: 'FK_brand_integrations_brand',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('brand_integrations', 'FK_brand_integrations_brand');
    await queryRunner.dropTable('brand_integrations');
  }
}
