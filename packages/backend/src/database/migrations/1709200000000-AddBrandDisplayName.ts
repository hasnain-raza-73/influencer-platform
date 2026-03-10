import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBrandDisplayName1709200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add display_name column (nullable initially)
    await queryRunner.addColumn(
      'brands',
      new TableColumn({
        name: 'display_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Backfill display_name with company_name for existing brands
    await queryRunner.query(`
      UPDATE brands
      SET display_name = company_name
      WHERE display_name IS NULL
    `);

    // Add column comment for documentation
    await queryRunner.query(`
      COMMENT ON COLUMN brands.display_name IS 'Public-facing brand name, falls back to company_name if not set'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop column
    await queryRunner.dropColumn('brands', 'display_name');
  }
}
