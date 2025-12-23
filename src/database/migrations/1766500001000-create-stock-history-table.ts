import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateStockHistoryTable1766500001000
  implements MigrationInterface
{
  private tableName = 'stock_history';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'stock_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'adjustment_type',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'quantity_delta',
      type: 'numeric',
      precision: 10,
      scale: 2,
    }),
    new TableColumn({
      name: 'quantity_before',
      type: 'numeric',
      precision: 10,
      scale: 2,
    }),
    new TableColumn({
      name: 'quantity_after',
      type: 'numeric',
      precision: 10,
      scale: 2,
    }),
    new TableColumn({
      name: 'reason',
      type: 'text',
      isNullable: true,
    }),
    new TableColumn({
      name: 'created_at',
      type: 'bigint',
      default: `FLOOR(EXTRACT(EPOCH FROM NOW()))`,
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_stock_history_stock_id',
      columnNames: ['stock_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'stocks',
      onDelete: 'CASCADE',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_stock_history_stock_id',
      columnNames: ['stock_id'],
    }),
    new TableIndex({
      name: 'idx_stock_history_created_at',
      columnNames: ['created_at'],
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: this.columns,
        foreignKeys: this.foreignKeys,
        indices: this.indices,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
