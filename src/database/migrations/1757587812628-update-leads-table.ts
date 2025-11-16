import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class UpdateLeadsTable1757587812628 implements MigrationInterface {
  private tableName = 'leads';

  private columns = [
    new TableColumn({
      name: 'product',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }),
    new TableColumn({
      name: 'score_tag',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_leads_source',
      columnNames: ['source'],
    }),
    new TableIndex({
      name: 'idx_leads_product',
      columnNames: ['product'],
    }),
    new TableIndex({
      name: 'idx_leads_score_tag',
      columnNames: ['score_tag'],
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);

    await queryRunner.createIndices(this.tableName, this.indices);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndices(this.tableName, this.indices);

    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
