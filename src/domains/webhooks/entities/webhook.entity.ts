import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { WebhookDto } from '../dto/webhook.dto';
import { WebhookStatus } from '../types';

@Entity({ name: 'webhooks' })
@SetDto(WebhookDto)
export class Webhook extends BaseEntity<WebhookDto> {
  @Column({ type: 'varchar', length: 255 })
  provider: string;

  @Column({ type: 'varchar', length: 255 })
  event: string;

  @Column({ type: 'varchar', length: 255 })
  reference: string;

  @Column({ type: 'varchar', length: 255 })
  status: WebhookStatus;

  @Column({ type: 'text' })
  data: string;
}
