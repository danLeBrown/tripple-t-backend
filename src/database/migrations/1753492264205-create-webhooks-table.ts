import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateWebhooksTable1753492264205 implements MigrationInterface {
  private tableName = 'webhooks';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'provider',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'event',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'reference',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'status',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'data',
      type: 'text',
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
      name: 'idx_webhooks_provider_event_reference',
      columnNames: ['provider', 'event', 'reference'],
      isUnique: true,
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
