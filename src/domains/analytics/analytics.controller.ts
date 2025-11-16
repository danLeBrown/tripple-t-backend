import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { AuditLog } from '../../decorators/audit-log.decorator';
import { AnalyticsService } from './analytics.service';
import { ActivityAnalyticsDto } from './dto/activity-analytics.dto';
import { ClientAnalyticsDto } from './dto/client-analytics.dto';
import { ClubMemberAnalyticsDto } from './dto/club-member.analytics.dto';
import { LeadAnalyticsDto } from './dto/lead-analytics.dto';
import { PerformanceSummaryAnalyticsDto } from './dto/performance-summary-analytics.dto';
import { TeamMemberPerformanceAnalyticsDto } from './dto/team-performance-analytics.dto';
import { TrendAnalyticsDto } from './dto/trends-analytics.dto';

@ApiBearerAuth()
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @AuditLog({
    model: 'Analytics',
    action: 'Get lead analytics',
  })
  @ApiOkResponse({
    description: 'Lead analytics data',
    type: LeadAnalyticsDto,
  })
  @Get('leads')
  async getLeadAnalytics() {
    const data = await this.analyticsService.getLeadAnalytics();

    return {
      data: new LeadAnalyticsDto(data),
    };
  }

  @AuditLog({
    model: 'Analytics',
    action: 'Get client analytics',
  })
  @ApiOkResponse({
    description: 'Client analytics data',
    type: ClientAnalyticsDto,
  })
  @Get('clients')
  async getClientAnalytics() {
    const data = await this.analyticsService.getClientAnalytics();

    return {
      data: new ClientAnalyticsDto(data),
    };
  }

  @AuditLog({
    model: 'Analytics',
    action: 'Get club member analytics',
  })
  @ApiOkResponse({
    description: 'Club member analytics data',
    type: ClubMemberAnalyticsDto,
  })
  @Get('club-members')
  async getClubMemberAnalytics() {
    const data = await this.analyticsService.getClubMemberAnalytics();

    return {
      data: new ClubMemberAnalyticsDto(data),
    };
  }

  @AuditLog({
    model: 'Analytics',
    action: 'Get activity analytics',
  })
  @ApiOkResponse({
    description: 'Activity analytics data',
    type: ActivityAnalyticsDto,
  })
  @Get('activities')
  async getActivityAnalytics() {
    const data = await this.analyticsService.getActivityAnalytics();

    return {
      data: new ActivityAnalyticsDto(data),
    };
  }

  @AuditLog({
    model: 'Analytics',
    action: 'Get performance summary analytics',
  })
  @ApiOkResponse({
    description: 'Performance summary analytics data',
    type: PerformanceSummaryAnalyticsDto,
  })
  @Get('performance-summary')
  async getPerformanceSummary() {
    const data = await this.analyticsService.getPerformanceSummary();

    return {
      data: new PerformanceSummaryAnalyticsDto(data),
    };
  }

  @AuditLog({
    model: 'Analytics',
    action: 'Get trend analytics',
  })
  @ApiOkResponse({
    description: 'Trend analytics data',
    type: [TrendAnalyticsDto],
  })
  @Get('trends')
  async getTrends() {
    const data = await this.analyticsService.getTrends();

    return {
      data: data.map((item) => new TrendAnalyticsDto(item)),
    };
  }

  @AuditLog({
    model: 'Analytics',
    action: 'Get team performance analytics',
  })
  @ApiOkResponse({
    description: 'Team performance analytics data',
    type: [TeamMemberPerformanceAnalyticsDto],
  })
  @Get('team-performance')
  async getTeamPerformance() {
    const data = await this.analyticsService.getTeamPerformance();

    return {
      data,
    };
  }
}
