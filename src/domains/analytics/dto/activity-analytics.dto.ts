import { ApiProperty } from '@nestjs/swagger';

import { ActivityDto } from '@/domains/shared/activities/dto/activity.dto';

export class ActivityAnalyticsDto {
  @ApiProperty({
    description: 'Total number of activities',
    example: 150,
  })
  total_activities: number;

  @ApiProperty({
    description: 'Total number of activities today',
    example: {
      total: 30,
      group_by_type: { meeting: 10, call: 5, email: 3 },
    },
  })
  today_activities: {
    total: number;
    group_by_type: Record<string, number>;
  };

  @ApiProperty({
    description: 'Team activity leaderboard',
    example: {
      this_week: {
        total: 50,
        group_by_user: [
          { name: 'John Doe', total: 20 },
          { name: 'Jane Smith', total: 15 },
          { name: 'Bob Johnson', total: 10 },
        ],
      },
      today: {
        total: 10,
        group_by_user: [
          { user_id: '1', total: 5 },
          { user_id: '2', total: 3 },
          { user_id: '3', count: 2 },
        ],
      },
    },
  })
  team_activity_leaderboard: {
    this_week: {
      total: number;
      group_by_user: Array<{ name: string; total: number }>;
    };
    today: {
      total: number;
      group_by_user: Array<{ name: string; total: number }>;
    };
  };
  @ApiProperty({
    description: 'Recent activities',
    type: [ActivityDto],
  })
  recent_activities: ActivityDto[];

  constructor(data: {
    total_activities: number;
    today_activities: {
      total: number;
      group_by_type: Record<string, number>;
    };
    team_activity_leaderboard: {
      this_week: {
        total: number;
        group_by_user: Array<{ name: string; total: number }>;
      };
      today: {
        total: number;
        group_by_user: Array<{ name: string; total: number }>;
      };
    };
    recent_activities: ActivityDto[];
  }) {
    this.total_activities = data.total_activities;
    this.today_activities = data.today_activities;
    this.team_activity_leaderboard = data.team_activity_leaderboard;
    this.recent_activities = data.recent_activities;
  }
}
