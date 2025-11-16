import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { AuditLog } from '@/decorators/audit-log.decorator';

import { InAppNotificationDto } from './dto/in-app-notification.dto';
import { QueryInAppNotificationDto } from './dto/query-in-app-notification.dto';
import { MarkAsReadInAppNotificationDto } from './dto/update-in-app-notification.dto';
import { InAppNotificationsService } from './in-app-notifications.service';

@ApiBearerAuth()
@Controller({
  path: 'in-app-notifications',
  version: '1',
})
export class InAppNotificationsController {
  constructor(
    private readonly inAppNotificationsService: InAppNotificationsService,
  ) {}

  @ApiOkResponse({
    description: 'List of in-app notifications',
    type: [InAppNotificationDto],
  })
  @AuditLog({
    model: 'InAppNotification',
    action: 'List in-app notifications',
  })
  @Get('')
  async findBy(@Query() dto: QueryInAppNotificationDto) {
    const data = await this.inAppNotificationsService.findBy(dto);

    return {
      data: InAppNotificationDto.collection(data),
    };
  }

  @ApiOkResponse({
    description: 'Mark in-app notifications as read',
  })
  @AuditLog({
    model: 'InAppNotification',
    action: 'Mark as read',
  })
  @Patch('read')
  async markAsRead(@Body() dto: MarkAsReadInAppNotificationDto) {
    await this.inAppNotificationsService.markAsRead(dto);

    return {
      message: 'Notifications marked as read successfully',
    };
  }
}
