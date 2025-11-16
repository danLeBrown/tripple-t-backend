import { ApiProperty } from '@nestjs/swagger';

export class ClubMemberAnalyticsDto {
  @ApiProperty({
    description: 'Total number of club members',
    example: 150,
  })
  total_club_members: number;

  @ApiProperty({
    description: 'Total number of club members this month',
    example: 30,
  })
  total_club_members_this_month: number;

  @ApiProperty({
    description: 'Group club members by status',
    example: { new: 10, contacted: 5, qualified: 3 },
  })
  group_by_status: Record<string, number>;

  constructor(data: {
    total_club_members: number;
    total_club_members_this_month: number;
    group_by_status: Record<string, number>;
  }) {
    this.total_club_members = data.total_club_members;
    this.total_club_members_this_month = data.total_club_members_this_month;
    this.group_by_status = data.group_by_status;
  }
}
