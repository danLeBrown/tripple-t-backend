import { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableColumn, TableIndex } from 'typeorm';

export class CreateSuppliersTable1763294253302 implements MigrationInterface {
  private tableName = 'suppliers';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'first_name',
      type: 'varchar',
      length: '100',
    }),
    new TableColumn({
      name: 'last_name',
      type: 'varchar',
      length: '100',
    }),
    new TableColumn({
      name: 'email',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }),
    new TableColumn({
      name: 'phone_number',
      type: 'varchar',
      length: '100',
    }),
    new TableColumn({
      name: 'status',
      type: 'varchar',
      length: '50',
    }),
    new TableColumn({
      name: 'address',
      type: 'text',
    }),
    new TableColumn({
      name: 'state',
      type: 'varchar',
      length: '100',
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
      name: 'idx_suppliers_first_name',
      columnNames: ['first_name'],
    }),
    new TableIndex({
      name: 'idx_suppliers_last_name',
      columnNames: ['last_name'],
    }),
    new TableIndex({
      name: 'idx_suppliers_email',
      columnNames: ['email'],
    }),
    new TableIndex({
      name: 'idx_suppliers_phone_number',
      columnNames: ['phone_number'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_suppliers_created_at',
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
