import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InAppNotification } from './in-app-notifications/entities/in-app-notification.entity';
import { InAppNotificationsController } from './in-app-notifications/in-app-notifications.controller';
import { InAppNotificationsService } from './in-app-notifications/in-app-notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InAppNotification]),
    BullModule.registerQueue({ name: 'in-app-notifications' }),
  ],
  controllers: [InAppNotificationsController],
  providers: [InAppNotificationsService],
  exports: [InAppNotificationsService],
})
export class NotificationsModule {}
