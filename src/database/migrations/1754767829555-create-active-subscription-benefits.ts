import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateActiveSubscriptionBenefits1754767829555
  implements MigrationInterface
{
  private tableName = 'active_subscription_benefits';

  private columns = [
    new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }),
    new TableColumn({
      name: 'active_subscription_id',
      type: 'uuid',
    }),
    new TableColumn({
      name: 'benefit_name',
      type: 'varchar',
      length: '255',
    }),
    new TableColumn({
      name: 'benefit_description',
      type: 'text',
      isNullable: true,
    }),
    new TableColumn({
      name: 'used',
      type: 'int',
      unsigned: true,
      isNullable: true,
    }),
    new TableColumn({
      name: 'limit',
      type: 'int',
    }),
    new TableColumn({
      name: 'percentage',
      type: 'int',
      unsigned: true,
      isNullable: true,
    }),
    new TableColumn({
      name: 'duration_in_months',
      type: 'int',
      unsigned: true,
      isNullable: true,
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
      name: 'idx_active_subscription_benefits_active_subscription_id',
      columnNames: ['active_subscription_id'],
    }),
  ];

  private foreignKeys = [
    new TableForeignKey({
      name: 'fk_active_subscription_benefits_active_subscription_id',
      columnNames: ['active_subscription_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'active_subscriptions',
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
