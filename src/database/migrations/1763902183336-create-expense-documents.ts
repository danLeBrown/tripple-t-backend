import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';
import { Table, TableColumn, TableIndex } from 'typeorm';

export class CreateExpenseDocuments1763902183336 implements MigrationInterface {
  private tableName = 'expense_documents';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'expense_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'document_id',
      type: 'uuid',
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
      name: 'idx_expense_documents_expense_id',
      columnNames: ['expense_id'],
    }),
    new TableIndex({
      name: 'idx_expense_documents_document_id',
      columnNames: ['document_id'],
    }),
    new TableIndex({
      name: 'idx_expense_documents_created_at',
      columnNames: ['created_at'],
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_expense_documents_expense_id',
      columnNames: ['expense_id'],
      referencedTableName: 'expenses',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }),
    new TableForeignKey({
      name: 'fk_expense_documents_document_id',
      columnNames: ['document_id'],
      referencedTableName: 'documents',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: this.columns,
        indices: this.indices,
        foreignKeys: this.foreignKeys,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
