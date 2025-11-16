import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateInAppNotificationDto {
  @ApiProperty({
    description: 'The ID of the user who will receive the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'The title of the notification',
    example: 'New message received',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The content of the notification message',
    example: 'You have a new message from John Doe',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
