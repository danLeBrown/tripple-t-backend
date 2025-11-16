import { Injectable } from '@nestjs/common';
import { addDays, getUnixTime, startOfDay, startOfWeek } from 'date-fns';

import { UsersService } from '../auth/users/users.service';
import { ClientsService } from '../clients/clients.service';
import { ActiveSubscriptionsService } from '../clients/club-members/active-subscription/active-subscriptions.service';
import { ClubMembersService } from '../clients/club-members/club-members.service';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../shared/activities/activities.service';
import { ActivityDto } from '../shared/activities/dto/activity.dto';
import { TeamMemberPerformanceAnalyticsDto } from './dto/team-performance-analytics.dto';
import {
  groupActivityByUser,
  groupByLabel,
  sortActivityByUserCount,
} from './helpers';

@Injectable()
export class AnalyticsService {
  static readonly RECENT_ACTIVITIES_LIMIT = 10;

  USERS_TABLE = 'users';
  ROLES_TABLE = 'roles';
  USER_ROLES_TABLE = 'user_roles';

  constructor(
    private leadsService: LeadsService,
    private clientsService: ClientsService,
    private clubMembersService: ClubMembersService,
    private activitiesService: ActivitiesService,
    private activeSubscriptionsService: ActiveSubscriptionsService,
    private usersService: UsersService,
  ) {}

  async getLeadAnalytics() {
    const leads = await this.leadsService.findByAndLoadRelations();

    return {
      total_leads: leads.length,
      total_leads_this_month: leads.filter((lead) => {
        const createdAt = new Date(lead.created_at * 1000);
        const currentMonth = new Date().getMonth();
        return createdAt.getMonth() === currentMonth;
      }).length,
      group_by_status: groupByLabel(leads, 'status'),
    };
  }

  async getClientAnalytics() {
    const clients = await this.clientsService.findByAndLoadRelations();

    return {
      total_clients: clients.length,
      total_clients_this_month: clients.filter((client) => {
        const createdAt = new Date(client.created_at * 1000);
        const currentMonth = new Date().getMonth();
        return createdAt.getMonth() === currentMonth;
      }).length,
      group_by_status: groupByLabel(clients, 'status'),
    };
  }

  async getClubMemberAnalytics() {
    const clubMembers = await this.clubMembersService.findByAndLoadRelations();

    return {
      total_club_members: clubMembers.length,
      total_club_members_this_month: clubMembers.filter((member) => {
        const createdAt = new Date(member.created_at * 1000);
        const currentMonth = new Date().getMonth();
        return createdAt.getMonth() === currentMonth;
      }).length,
      group_by_status: clubMembers.reduce(
        (acc, member) => {
          acc[member.status] = (acc[member.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async getActivityAnalytics() {
    const activities = await this.activitiesService.findByAndLoadRelations({
      relations: {
        admin_user: true,
      },
      order: {
        created_at: 'DESC',
      },
    });

    const startOfToday = getUnixTime(startOfDay(new Date()));
    const startOfTomorrow = getUnixTime(startOfDay(addDays(new Date(), 1)));
    const todayActivities = activities.filter(
      (activity) =>
        activity.created_at >= startOfToday &&
        activity.created_at < startOfTomorrow,
    );

    const weekStart = getUnixTime(startOfWeek(new Date(), { weekStartsOn: 0 }));
    const weekEnd = getUnixTime(addDays(new Date(weekStart * 1000), 6));

    const thisWeekActivities = activities.filter(
      (activity) =>
        activity.created_at >= weekStart && activity.created_at <= weekEnd,
    );

    return {
      total_activities: activities.length,
      today_activities: {
        total: todayActivities.length,
        group_by_type: groupByLabel(todayActivities, 'type'),
      },
      team_activity_leaderboard: {
        this_week: {
          total: thisWeekActivities.length,
          group_by_user: sortActivityByUserCount(
            groupActivityByUser(thisWeekActivities),
          ),
        },
        today: {
          total: todayActivities.length,
          group_by_user: sortActivityByUserCount(
            groupActivityByUser(todayActivities),
          ),
        },
      },
      recent_activities: ActivityDto.collection(
        activities.slice(0, AnalyticsService.RECENT_ACTIVITIES_LIMIT),
      ),
    };
  }

  async getPerformanceSummary() {
    const clients = await this.clientsService.count();

    const clubMembers = await this.clubMembersService.count();

    const { converted } = await this.clientsService.getConvertedCount();

    return {
      total_revenue:
        await this.activeSubscriptionsService.getTotalRevenue(true),
      total_clients: clients,
      conversion_rate:
        clients > 0 ? Math.round((converted / clients) * 100) : 0,
      total_club_members: clubMembers,
    };
  }

  async getTrends() {
    return [
      {
        name: 'revenue_trends',
        data: await this.activeSubscriptionsService.getRevenueTrend(),
      },
      {
        name: 'conversion_rate_trends',
        data: await this.activeSubscriptionsService.getConversationRateTrend(),
      },
    ];
  }

  async getTeamPerformance() {
    const performance: Array<{
      admin_user_id: string;
      role: string;
      full_name: string;
      total_revenue: number;
      total_clients: number;
      // clients_with_revenue: number;
      conversion_rate: number;
    }> = await this.clientsService
      .getClientRepo()
      .createQueryBuilder()
      .addCommonTableExpression(
        this.activeSubscriptionsService.getQueryToGroupTotalRevenueByClient(),
        'revenue',
      )
      .addCommonTableExpression(
        this.clientsService
          .getClientRepo()
          .createQueryBuilder('c')
          .select('c.admin_user_id', 'admin_user_id')
          .addSelect('COUNT(c.id)', 'total_clients')
          .addSelect('COUNT(rev.client_id)', 'clients_with_revenue')
          .addSelect('COALESCE(SUM(rev.total_revenue), 0)', 'total_revenue')
          .leftJoin('revenue', 'rev', 'rev.client_id = c.id')
          .groupBy('c.admin_user_id'),
        'admin_stats',
      )
      .select('ast.admin_user_id', 'admin_user_id')
      .addSelect('r.name', 'role')
      .addSelect("CONCAT(u.first_name, ' ', u.last_name)", 'full_name')
      .addSelect('ast.total_revenue', 'total_revenue')
      .addSelect('ast.total_clients', 'total_clients')
      .addSelect(
        `CASE
        WHEN ast.total_clients > 0
        THEN ROUND((ast.clients_with_revenue::DECIMAL / ast.total_clients) * 100, 2)
        ELSE 0
      END as conversion_rate`,
      )
      .from('admin_stats', 'ast')
      .leftJoin(this.USERS_TABLE, 'u', 'u.id = ast.admin_user_id')
      .leftJoin(this.USER_ROLES_TABLE, 'ur', 'ur.user_id = u.id')
      .leftJoin(this.ROLES_TABLE, 'r', 'ur.role_id = r.id')
      .groupBy('u.id')
      .addGroupBy('r.name')
      .addGroupBy('ast.admin_user_id')
      .addGroupBy('ast.total_revenue')
      .addGroupBy('ast.total_clients')
      .addGroupBy('ast.clients_with_revenue')
      .orderBy('ast.total_revenue', 'DESC')
      .getRawMany();

    return performance.map(
      (item) => new TeamMemberPerformanceAnalyticsDto(item),
    );
  }
}
