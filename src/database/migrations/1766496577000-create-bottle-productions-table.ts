import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateBottleProductionsTable1766496577000
  implements MigrationInterface
{
  private tableName = 'bottle_productions';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'preform_supplier_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'supplier_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'preform_product_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'preform_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'bottle_product_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'bottle_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'preform_size',
      type: 'numeric',
      precision: 10,
      scale: 2,
    }),
    new TableColumn({
      name: 'preform_color',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'preforms_used',
      type: 'int',
    }),
    new TableColumn({
      name: 'preforms_defective',
      type: 'int',
    }),
    new TableColumn({
      name: 'bottle_size',
      type: 'numeric',
      precision: 10,
      scale: 2,
    }),
    new TableColumn({
      name: 'bottle_color',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'bottles_produced',
      type: 'int',
    }),
    new TableColumn({
      name: 'bottles_defective',
      type: 'int',
    }),
    new TableColumn({
      name: 'produced_at',
      type: 'bigint',
    }),
    new TableColumn({
      name: 'notes',
      type: 'text',
      isNullable: true,
    }),
    new TableColumn({
      name: 'deleted_at',
      type: 'bigint',
      isNullable: true,
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
      name: 'fk_bottle_productions_preform_supplier_id',
      columnNames: ['preform_supplier_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'suppliers',
      onDelete: 'RESTRICT',
    }),
    new TableForeignKey({
      name: 'fk_bottle_productions_preform_product_id',
      columnNames: ['preform_product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'RESTRICT',
    }),
    new TableForeignKey({
      name: 'fk_bottle_productions_bottle_product_id',
      columnNames: ['bottle_product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'RESTRICT',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_bottle_productions_preform_supplier_id',
      columnNames: ['preform_supplier_id'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_supplier_name',
      columnNames: ['supplier_name'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_preform_product_id',
      columnNames: ['preform_product_id'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_bottle_product_id',
      columnNames: ['bottle_product_id'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_preform_name',
      columnNames: ['preform_name'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_preform_size',
      columnNames: ['preform_size'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_bottle_size',
      columnNames: ['bottle_size'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_produced_at',
      columnNames: ['produced_at'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_deleted_at',
      columnNames: ['deleted_at'],
    }),
    new TableIndex({
      name: 'idx_bottle_productions_created_at',
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
