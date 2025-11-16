import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateLeadsTable1748232668922 implements MigrationInterface {
  private tableName = 'leads';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'admin_user_id',
      type: 'uuid',
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
      name: 'status',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'source',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'notes',
      type: 'text',
      isNullable: true,
    }),
    new TableColumn({
      name: 'last_contacted_at',
      type: 'int',
      isNullable: true,
    }),
    new TableColumn({
      name: 'next_follow_up_at',
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
    {
      name: 'fk_leads_admin_user_id',
      columnNames: ['admin_user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'SET NULL',
    },
  ];

  private indices = [
    {
      name: 'idx_leads_first_name',
      columnNames: ['first_name'],
    },
    {
      name: 'idx_leads_last_name',
      columnNames: ['last_name'],
    },
    {
      name: 'idx_leads_email',
      columnNames: ['email'],
    },
    {
      name: 'idx_leads_phone_number',
      columnNames: ['phone_number'],
    },
    {
      name: 'idx_leads_status',
      columnNames: ['status'],
    },
    {
      name: 'idx_leads_admin_user_id',
      columnNames: ['admin_user_id'],
    },
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
