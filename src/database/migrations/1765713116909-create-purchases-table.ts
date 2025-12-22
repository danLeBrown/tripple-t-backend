import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePurchasesTable1765713116909 implements MigrationInterface {
  private tableName = 'purchases';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'purchase_invoice_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'product_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'product_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'supplier_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'supplier_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'quantity_in_bags',
      type: 'int',
    }),
    new TableColumn({
      name: 'price_per_bag',
      type: 'int',
    }),
    new TableColumn({
      name: 'total_price',
      type: 'int',
    }),
    new TableColumn({
      name: 'purchased_at',
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

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_purchases_purchase_invoice_id',
      columnNames: ['purchase_invoice_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'purchase_invoices',
    }),
    new TableForeignKey({
      name: 'fk_purchases_product_id',
      columnNames: ['product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
    }),
    new TableForeignKey({
      name: 'fk_purchases_supplier_id',
      columnNames: ['supplier_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'suppliers',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_purchases_purchase_invoice_id',
      columnNames: ['purchase_invoice_id'],
    }),
    new TableIndex({
      name: 'idx_purchases_product_id',
      columnNames: ['product_id'],
    }),
    new TableIndex({
      name: 'idx_purchases_supplier_id',
      columnNames: ['supplier_id'],
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
