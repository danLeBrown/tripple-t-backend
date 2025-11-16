import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryInAppNotificationDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user whose notifications are being queried',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Filter by read status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'boolean' ? Boolean(value) : value === 'true',
  )
  is_read?: boolean;
}
