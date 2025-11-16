import { ApiProperty } from '@nestjs/swagger';

export class PerformanceSummaryAnalyticsDto {
  @ApiProperty({
    description: 'Total revenue from active subscriptions',
    example: 5000,
  })
  total_revenue: number;

  @ApiProperty({
    description: 'Total number of clients',
    example: 100,
  })
  total_clients: number;

  @ApiProperty({
    description: 'Conversion rate from leads to clients',
    example: '5%',
  })
  conversion_rate: string;

  @ApiProperty({
    description: 'Total number of Club Connect members',
    example: 80,
  })
  total_club_members: number;

  constructor(data: {
    total_revenue: number;
    total_clients: number;
    conversion_rate: number;
    total_club_members: number;
  }) {
    this.total_revenue = data.total_revenue;
    this.total_clients = data.total_clients;
    this.conversion_rate = `${data.conversion_rate}%`;
    this.total_club_members = data.total_club_members;
  }
}
