import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateTagsTable1749421402746 implements MigrationInterface {
  private tableName = 'tags';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'resource_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'resource_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'slug',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'value',
      type: 'varchar',
      length: '255',
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
      name: 'idx_tags_resource_name',
      columnNames: ['resource_name'],
    }),
    new TableIndex({
      name: 'idx_tags_resource_id',
      columnNames: ['resource_id'],
    }),
    new TableIndex({
      name: 'idx_tags_slug',
      columnNames: ['slug'],
    }),
    new TableIndex({
      name: 'idx_tags_resource_name_slug_resource_id',
      columnNames: ['resource_name', 'slug', 'resource_id'],
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
    await queryRunner.dropTable(this.tableName, true, true, true);
    // await queryRunner.clearSqlMemory();
  }
}
