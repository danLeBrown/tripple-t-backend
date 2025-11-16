import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndicesToClients1754169310512 implements MigrationInterface {
  private tableName = 'clients';

  private indices = [
    new TableIndex({
      name: 'idx_clients_email',
      columnNames: ['email'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_clients_phone_number',
      columnNames: ['phone_number'],
      isUnique: true,
    }),
    new TableIndex({
      name: 'idx_clients_lead_id',
      columnNames: ['lead_id'],
      isUnique: true,
    }),
  ];

  private columnsToDrop = ['company_name', 'revenue', 'membership_level'];
  private indicesToDrop = [
    new TableIndex({
      name: 'idx_clients_lead_id',
      columnNames: ['lead_id'],
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columnsToDrop);
    await queryRunner.dropIndices(this.tableName, this.indicesToDrop);
    await queryRunner.createIndices(this.tableName, this.indices);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndices(this.tableName, this.indices);
    // await queryRunner.createIndices(this.tableName, this.indicesToDrop);
  }
}
