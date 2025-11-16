import { Module } from '@nestjs/common';

import { ClientsModule } from '@/domains/clients/clients.module';
import { NotificationsModule } from '@/domains/notifications/notifications.module';

import { FetchClientsJob } from './jobs/fetch-clients.job';
import { FollowUpReminderJob } from './jobs/follow-up-reminder.job';

@Module({
  imports: [ClientsModule, NotificationsModule],
  providers: [FetchClientsJob, FollowUpReminderJob],
  controllers: [],
  exports: [FetchClientsJob, FollowUpReminderJob],
})
export class TaskSchedulerModule {}
