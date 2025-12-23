import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterSizesAndProductSizeToDecimal1766489889812
  implements MigrationInterface
{
  private sizesTable = 'sizes';
  private productsTable = 'products';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.sizesTable,
      'value',
      new TableColumn({
        name: 'value',
        type: 'numeric',
        precision: 10,
        scale: 2,
        isUnique: true,
      }),
    );

    await queryRunner.changeColumn(
      this.productsTable,
      'size',
      new TableColumn({
        name: 'size',
        type: 'numeric',
        precision: 10,
        scale: 2,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.productsTable,
      'size',
      new TableColumn({
        name: 'size',
        type: 'int',
      }),
    );

    await queryRunner.changeColumn(
      this.sizesTable,
      'value',
      new TableColumn({
        name: 'value',
        type: 'int',
        isUnique: true,
      }),
    );
  }
}
