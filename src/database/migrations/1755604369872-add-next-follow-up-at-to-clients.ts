import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNextFollowUpAtToClients1755604369872
  implements MigrationInterface
{
  private tableName = 'clients';

  private columns = [
    new TableColumn({
      name: 'next_follow_up_at',
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
