import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateFollowUps1755445971927 implements MigrationInterface {
  private tableName = 'follow_ups';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'user_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'resource_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'resource_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'is_done',
      type: 'boolean',
      default: false,
    }),
    new TableColumn({
      name: 'follow_up_at',
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
      name: 'idx_follow_ups_resource_name_resource_id',
      columnNames: ['resource_name', 'resource_id'],
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
