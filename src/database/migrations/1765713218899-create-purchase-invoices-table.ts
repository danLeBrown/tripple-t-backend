import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePurchaseInvoicesTable1765713218899
  implements MigrationInterface
{
  private tableName = 'purchase_invoices';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'supplier_id',
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

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_purchase_invoices_supplier_id',
      columnNames: ['supplier_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'suppliers',
    }),
    new TableForeignKey({
      name: 'fk_purchase_invoices_document_id',
      columnNames: ['document_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'documents',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_purchase_invoices_supplier_id',
      columnNames: ['supplier_id'],
    }),
    new TableIndex({
      name: 'idx_purchase_invoices_document_id',
      columnNames: ['document_id'],
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
