import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddIsOnboardedToClients1757587715620
  implements MigrationInterface
{
  private tableName = 'clients';

  private columns = [
    new TableColumn({
      name: 'is_onboarded',
      type: 'boolean',
      default: false,
    }),
  ];

  private indices = [
    new TableIndex({
      name: 'idx_clients_is_onboarded',
      columnNames: ['is_onboarded'],
    }),
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
    await queryRunner.createIndices(this.tableName, this.indices);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndices(this.tableName, this.indices);
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
