import { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableColumn, TableIndex } from 'typeorm';

export class CreateExpensesTable1763902096923 implements MigrationInterface {
  private tableName = 'expenses';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'category',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'amount',
      type: 'int',
    }),
    new TableColumn({
      name: 'narration',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'has_been_calculated',
      type: 'boolean',
      default: false,
    }),
    new TableColumn({
      name: 'reported_at',
      type: 'bigint',
    }),
    new TableColumn({
      name: 'created_at',
      type: 'bigint',
      default: `FLOOR(EXTRACT(EPOCH FROM NOW()))`,
    }),
    new TableColumn({
      name: 'updated_at',
      type: 'bigint',
      default: `FLOOR(EXTRACT(EPOCH FROM NOW()))`,
      onUpdate: `FLOOR(EXTRACT(EPOCH FROM NOW()))`,
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_expenses_category',
      columnNames: ['category'],
    }),
    new TableIndex({
      name: 'idx_expenses_amount',
      columnNames: ['amount'],
    }),
    new TableIndex({
      name: 'idx_expenses_narration',
      columnNames: ['narration'],
    }),
    new TableIndex({
      name: 'idx_expenses_has_been_calculated',
      columnNames: ['has_been_calculated'],
    }),
    new TableIndex({
      name: 'idx_expenses_reported_at',
      columnNames: ['reported_at'],
    }),
    new TableIndex({
      name: 'idx_expenses_created_at',
      columnNames: ['created_at'],
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: this.columns,
        indices: this.indices,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
