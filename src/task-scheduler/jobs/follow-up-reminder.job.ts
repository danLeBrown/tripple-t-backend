import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InAppNotificationsService } from '@/domains/notifications/in-app-notifications/in-app-notifications.service';
import { FollowUpsService } from '@/domains/shared/follow-ups/follow-ups.service';

@Injectable()
export class FollowUpReminderJob {
  private readonly logger = new Logger(FollowUpReminderJob.name);

  constructor(
    private followUpsService: FollowUpsService,
    private inAppNotificationsService: InAppNotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM, {})
  async handleCron(timestamp_today?: number) {
    this.logger.log('Fetching follow-ups due for a reminder...');

    const followUps = await this.followUpsService.findDueToday(timestamp_today);

    return Promise.all(
      followUps.map(async (followUp) => {
        const first_name =
          followUp.lead?.first_name || followUp.client?.first_name;
        const last_name =
          followUp.lead?.last_name || followUp.client?.last_name;

        if (followUp.resource_name === 'leads' && !followUp.lead) {
          return null;
        }

        if (followUp.resource_name === 'clients' && !followUp.client) {
          return null;
        }

        return this.inAppNotificationsService.create({
          user_id: followUp.user_id,
          title: 'Follow Up Reminder',
          message: `${first_name} ${last_name} is due for a follow-up`,
        });
      }),
    );
  }
}
