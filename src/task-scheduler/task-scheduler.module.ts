import { Module } from '@nestjs/common';

import { NotificationsModule } from '@/domains/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [],
})
export class TaskSchedulerModule {}
