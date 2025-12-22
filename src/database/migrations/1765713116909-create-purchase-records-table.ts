import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePurchaseRecordsTable1765713116909
  implements MigrationInterface
{
  private tableName = 'purchase_records';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'upload_id',
      type: 'uuid',
      isNullable: true,
    }),
    new TableColumn({
      name: 'product_id',
      type: 'uuid',
      isNullable: true,
    }),
    new TableColumn({
      name: 'product_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'product_type',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'supplier_id',
      type: 'uuid',
      isNullable: true,
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
      name: 'has_been_calculated',
      type: 'boolean',
      default: false,
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
      name: 'fk_purchase_records_upload_id',
      columnNames: ['upload_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'uploads',
      onDelete: 'SET NULL',
    }),
    new TableForeignKey({
      name: 'fk_purchase_records_product_id',
      columnNames: ['product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'SET NULL',
    }),
    new TableForeignKey({
      name: 'fk_purchase_records_supplier_id',
      columnNames: ['supplier_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'suppliers',
      onDelete: 'SET NULL',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_purchase_records_product_id',
      columnNames: ['product_id'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_product_name',
      columnNames: ['product_name'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_product_type',
      columnNames: ['product_type'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_supplier_id',
      columnNames: ['supplier_id'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_supplier_name',
      columnNames: ['supplier_name'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_has_been_calculated',
      columnNames: ['has_been_calculated'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_purchased_at',
      columnNames: ['purchased_at'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_total_price',
      columnNames: ['total_price'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_created_at',
      columnNames: ['created_at'],
    }),
    new TableIndex({
      name: 'idx_purchase_records_updated_at',
      columnNames: ['updated_at'],
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
