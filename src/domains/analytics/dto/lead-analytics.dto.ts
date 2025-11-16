import { ApiProperty } from '@nestjs/swagger';

export class LeadAnalyticsDto {
  @ApiProperty({
    description: 'Total number of leads',
    example: 150,
  })
  total_leads: number;

  @ApiProperty({
    description: 'Total number of leads this month',
    example: 30,
  })
  total_leads_this_month: number;

  @ApiProperty({
    description: 'Group leads by status',
    example: { new: 10, contacted: 5, qualified: 3 },
  })
  group_by_status: Record<string, number>;

  constructor(data: {
    total_leads: number;
    total_leads_this_month: number;
    group_by_status: Record<string, number>;
  }) {
    this.total_leads = data.total_leads;
    this.total_leads_this_month = data.total_leads_this_month;
    this.group_by_status = data.group_by_status;
  }
}
