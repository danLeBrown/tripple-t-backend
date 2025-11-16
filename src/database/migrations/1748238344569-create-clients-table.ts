import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateClientsTable1748238344569 implements MigrationInterface {
  private tableName = 'clients';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'lead_id',
      type: 'uuid',
      isNullable: true,
    }),
    new TableColumn({
      name: 'admin_user_id',
      type: 'uuid',
      isNullable: true,
    }),
    new TableColumn({
      name: 'first_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'last_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'email',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'phone_number',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'company_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'revenue',
      type: 'int',
      default: 0,
    }),
    new TableColumn({
      name: 'membership_level',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'status',
      type: 'varchar',
      length: '255',
      default: `'active'`, // Default status can be set to 'active' or any other initial value
    }),
    new TableColumn({
      name: 'last_contacted_at',
      type: 'int',
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
      name: 'fk_clients_lead_id',
      columnNames: ['lead_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'leads',
      onDelete: 'SET NULL',
    }),
    new TableForeignKey({
      name: 'fk_clients_admin_user_id',
      columnNames: ['admin_user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'SET NULL',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_clients_lead_id',
      columnNames: ['lead_id'],
    }),
    new TableIndex({
      name: 'idx_clients_first_name',
      columnNames: ['first_name'],
    }),
    new TableIndex({
      name: 'idx_clients_last_name',
      columnNames: ['last_name'],
    }),
    new TableIndex({
      name: 'idx_clients_status',
      columnNames: ['status'],
    }),
    new TableIndex({
      name: 'idx_clients_membership_level',
      columnNames: ['membership_level'],
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
