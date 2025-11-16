import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateDocumentsTable1749732686031 implements MigrationInterface {
  private tableName = 'documents';

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
      name: 'upload_id',
      type: 'uuid',
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
      name: 'fk_documents_upload_id',
      columnNames: ['upload_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'uploads',
      onDelete: 'CASCADE',
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_documents_resource_name',
      columnNames: ['resource_name'],
    }),
    new TableIndex({
      name: 'idx_documents_resource_id',
      columnNames: ['resource_id'],
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
    await queryRunner.dropTable(this.tableName, true, true, true);
  }
}
