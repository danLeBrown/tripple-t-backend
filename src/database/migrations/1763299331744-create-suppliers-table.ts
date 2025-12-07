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
      name: 'business_name',
      type: 'varchar',
      length: '100',
    }),
    new TableColumn({
      name: 'contact_person_first_name',
      type: 'varchar',
      length: '100',
    }),
    new TableColumn({
      name: 'contact_person_last_name',
      type: 'varchar',
      length: '100',
    }),
    new TableColumn({
      name: 'contact_person_email',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }),
    new TableColumn({
      name: 'contact_person_phone_number',
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
      name: 'idx_suppliers_business_name',
      columnNames: ['business_name'],
    }),
    new TableIndex({
      name: 'idx_suppliers_contact_person_first_name',
      columnNames: ['contact_person_first_name'],
    }),
    new TableIndex({
      name: 'idx_suppliers_contact_person_last_name',
      columnNames: ['contact_person_last_name'],
    }),
    new TableIndex({
      name: 'idx_suppliers_contact_person_email',
      columnNames: ['contact_person_email'],
      isUnique: true,
      where: 'contact_person_email IS NOT NULL',
    }),
    new TableIndex({
      name: 'idx_suppliers_contact_person_phone_number',
      columnNames: ['contact_person_phone_number'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_suppliers_status',
      columnNames: ['status'],
    }),
    new TableIndex({
      name: 'idx_suppliers_address',
      columnNames: ['address'],
    }),
    new TableIndex({
      name: 'idx_suppliers_state',
      columnNames: ['state'],
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
