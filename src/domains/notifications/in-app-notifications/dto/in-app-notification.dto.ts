import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { InAppNotification } from '../entities/in-app-notification.entity';

export class InAppNotificationDto extends BaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who receives the notification',
  })
  user_id: string;

  @ApiProperty({
    example: 'New Notification',
    description: 'The title of the notification',
  })
  title: string;

  @ApiProperty({
    example: 'New message received',
    description: 'The content of the notification message',
  })
  message: string;

  @ApiProperty({
    example: 1625251200,
    description: 'The timestamp when the notification was read',
  })
  read_at: number | null;

  constructor(inAppNotification: InAppNotification) {
    super(inAppNotification);

    this.user_id = inAppNotification.user_id;
    this.title = inAppNotification.title;
    this.message = inAppNotification.message;
    this.read_at = inAppNotification.read_at;
  }
}
