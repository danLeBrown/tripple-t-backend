import { ApiProperty } from '@nestjs/swagger';

export class ClientAnalyticsDto {
  @ApiProperty({
    description: 'Total number of clients',
    example: 150,
  })
  total_clients: number;

  @ApiProperty({
    description: 'Total number of clients this month',
    example: 30,
  })
  total_clients_this_month: number;

  @ApiProperty({
    description:
      'A mapping of client statuses (e.g., "new", "contacted", "qualified") to their respective counts',
    example: { new: 10, contacted: 5, qualified: 3 },
  })
  group_by_status: Record<string, number>;

  constructor(data: {
    total_clients: number;
    total_clients_this_month: number;
    group_by_status: Record<string, number>;
  }) {
    this.total_clients = data.total_clients;
    this.total_clients_this_month = data.total_clients_this_month;
    this.group_by_status = data.group_by_status;
  }
}
