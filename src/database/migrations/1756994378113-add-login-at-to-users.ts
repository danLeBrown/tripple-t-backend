import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLoginAtToUsers1756994378113 implements MigrationInterface {
  name?: string | undefined;
  transaction?: boolean | undefined;
  private tableName = 'users';

  private columns = [
    new TableColumn({
      name: 'last_login_at',
      type: 'int',
      isNullable: true,
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
