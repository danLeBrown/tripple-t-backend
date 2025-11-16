import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateActiveSubscriptions1754767671000
  implements MigrationInterface
{
  private tableName = 'active_subscriptions';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'client_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'plan_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'plan_description',
      type: 'text',
    }),
    new TableColumn({
      name: 'price',
      type: 'int',
      unsigned: true,
    }),
    new TableColumn({
      name: 'duration_in_days',
      type: 'int',
    }),
    new TableColumn({
      name: 'hash',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'activated_at',
      type: 'int',
    }),
    new TableColumn({
      name: 'paused_at',
      type: 'int',
      isNullable: true,
    }),
    new TableColumn({
      name: 'terminated_at',
      type: 'int',
      isNullable: true,
    }),
    new TableColumn({
      name: 'expired_at',
      type: 'int',
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
      name: 'idx_active_subscriptions_client_id_hash',
      columnNames: ['client_id', 'hash'],
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_active_subscriptions_client_id',
      columnNames: ['client_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'clients',
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
