import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateCustomersTable1763294253302 implements MigrationInterface {
  private tableName = 'customers';

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
      name: 'idx_customers_business_name',
      columnNames: ['business_name'],
    }),
    new TableIndex({
      name: 'idx_customers_contact_person_last_name',
      columnNames: ['contact_person_last_name'],
    }),
    new TableIndex({
      name: 'idx_customers_contact_person_email',
      columnNames: ['contact_person_email'],
      isUnique: true,
      where: 'contact_person_email IS NOT NULL',
    }),
    new TableIndex({
      name: 'idx_customers_contact_person_phone_number',
      columnNames: ['contact_person_phone_number'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_customers_status',
      columnNames: ['status'],
    }),
    new TableIndex({
      name: 'idx_customers_address',
      columnNames: ['address'],
    }),
    new TableIndex({
      name: 'idx_customers_state',
      columnNames: ['state'],
    }),
    new TableIndex({
      name: 'idx_customers_created_at',
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
