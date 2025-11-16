import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MarkAsReadInAppNotificationDto {
  @ApiProperty({
    description:
      'The ID of the user whose notification is being marked as read',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'The IDs of the notifications being marked as read',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsUUID('all', { each: true })
  ids: string[];
}
