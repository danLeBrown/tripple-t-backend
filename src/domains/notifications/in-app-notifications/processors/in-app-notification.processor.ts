import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

import { InAppNotificationsService } from '../in-app-notifications.service';

@Processor('in-app-notifications')
export class InAppNotificationProcessor extends WorkerHost {
  private logger = new Logger(InAppNotificationProcessor.name);

  constructor(
    private readonly inAppNotificationsService: InAppNotificationsService,
  ) {
    super();
  }

  async process() {
    this.logger.log('In-App Notification Processor started');
    return void 0;
  }
}
