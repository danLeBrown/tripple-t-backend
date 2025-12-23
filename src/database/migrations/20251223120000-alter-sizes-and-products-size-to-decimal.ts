import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSizesAndProductsSizeToDecimal20251223120000
  implements MigrationInterface
{
  private sizesTable = 'sizes';
  private productsTable = 'products';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Preserve data and avoid drop/recreate by using raw ALTER TABLE.
    await queryRunner.query(
      `ALTER TABLE "${this.sizesTable}" ALTER COLUMN "value" TYPE numeric(10,2) USING "value"::numeric;`,
    );

    await queryRunner.query(
      `ALTER TABLE "${this.productsTable}" ALTER COLUMN "size" TYPE numeric(10,2) USING "size"::numeric;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${this.productsTable}" ALTER COLUMN "size" TYPE int USING "size"::int;`,
    );

    await queryRunner.query(
      `ALTER TABLE "${this.sizesTable}" ALTER COLUMN "value" TYPE int USING "value"::int;`,
    );
  }
}
