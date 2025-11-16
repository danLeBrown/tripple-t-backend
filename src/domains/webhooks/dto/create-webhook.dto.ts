import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'The provider of the webhook',
    example: 'connect-nigeria',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: 'The event type for the webhook',
    example: 'user.created',
  })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({
    description:
      'A unique reference for the webhook, typically an ID or a unique string',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({
    description: 'The payload data for the webhook',
    example: '{"key": "value"}',
  })
  @IsObject()
  data: Record<string, unknown>;
}
