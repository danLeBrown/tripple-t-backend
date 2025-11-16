import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Webhook } from '../entities/webhook.entity';
import { WebhookStatus } from '../types';

export class WebhookDto extends BaseDto {
  @ApiProperty({
    description: 'The provider of the webhook',
    example: 'connect-nigeria',
  })
  provider: string;
  @ApiProperty({
    description: 'The event type for the webhook',
    example: 'user.created',
  })
  event: string;

  @ApiProperty({
    description:
      'A unique reference for the webhook, typically an ID or a unique string',
    example: '12345',
  })
  reference: string;

  @ApiProperty({
    description: 'The current status of the webhook',
    example: 'pending',
  })
  status: WebhookStatus;

  @ApiProperty({
    description: 'The payload data for the webhook',
    example: '{"userId": "12345"}',
  })
  data: string;

  constructor(webhook: Webhook) {
    super(webhook);
    this.event = webhook.event;
    this.reference = webhook.reference;
    this.status = webhook.status;
    this.data = webhook.data;
  }
}
