import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateProducts1765060991568 implements MigrationInterface {
  private tableName = 'products';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'type',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'size',
      type: 'int',
    }),
    new TableColumn({
      name: 'colour',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'unit',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'slug',
      type: 'varchar',
      length: '255',
      isUnique: true,
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
      name: 'idx_products_type',
      columnNames: ['type'],
    }),
    new TableIndex({
      name: 'idx_products_size',
      columnNames: ['size'],
    }),
    new TableIndex({
      name: 'idx_products_colour',
      columnNames: ['colour'],
    }),
    new TableIndex({
      name: 'idx_products_unit',
      columnNames: ['unit'],
    }),
    new TableIndex({
      name: 'idx_products_slug',
      columnNames: ['slug'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_products_created_at',
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
